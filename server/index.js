require('dotenv').config();
const express = require('express');
const path = require('path');
const os = require('os');
const app = express();
const port = process.env.PORT || 8000; 
const dbAppRoute = require('./Routes/dbApp');
const chatBotRoute = require('./Routes/chatbot');
const webAppRoute = require('./Routes/webServer');
const iotRoute = require('./Routes/iot');
const appointmentsRoute = require('./Routes/appointments');
const centersRoute = require('./Routes/centers');
const vialRoute = require('./Routes/vial');
// const connectDB =require('./Routes/db');

var bodyParser=require('body-parser');
// const models = require('./models/index');
app.use(bodyParser.urlencoded({extended:true}));

// Log every incoming request so we can see if ESP32 reaches the server (code=-1 = you will NOT see this line for /iot/telemetry)
app.use((req, res, next) => {
  const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || req.connection?.remoteAddress || '?';
  console.log('[REQ]', req.method, req.url, 'from', ip);
  next();
});
// connectDB()
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET");
    return res.status(200).json({});
  }
  next();
});
app.use(express.json({extended:false}));

app.use('/database', dbAppRoute);
app.use('/chatbot', chatBotRoute);
app.use('/app', webAppRoute);
app.use('/iot', iotRoute);
app.use('/api/appointments', appointmentsRoute);
app.use('/api/centers', centersRoute);
app.use('/api/vial', vialRoute);
const logBuffer = require('./services/logBuffer');
const Telemetry = require('./models/Telemetry');
const Event = require('./models/Event');
const Shipment = require('./models/Shipment');

app.get('/api/log', (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 100, 200);
  res.json({ log: logBuffer.getRecent(limit) });
});

/** Simple ping – test from phone browser: http://YOUR_PC_IP:8000/api/ping (proves Server is reachable on network) */
app.get('/api/ping', (req, res) => {
  res.json({ ok: true, message: 'Server reachable', time: new Date().toISOString() });
});

/** Reset demo: clear all telemetry and events for VIAL-001, VIAL-002, VIAL-003 so demo starts clean */
app.post('/api/demo-reset', async (req, res) => {
  const demoVials = ['VIAL-001', 'VIAL-002', 'VIAL-003'];
  try {
    await Telemetry.deleteMany({ shipmentId: { $in: demoVials } });
    await Event.deleteMany({ shipmentId: { $in: demoVials } });
    await Shipment.deleteMany({ shipmentId: { $in: demoVials } });
    res.json({ ok: true, message: 'Demo data reset. Run a simulation to see data and QR update.' });
  } catch (err) {
    console.error('[demo-reset]', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

/** Diagnostic: last 5 telemetry for a vial – open in browser to see if ESP32 is reaching the Server */
app.get('/api/last-telemetry/:vialId', async (req, res) => {
  try {
    const docs = await Telemetry.find({ shipmentId: req.params.vialId })
      .sort({ ts: -1, _id: -1 })
      .limit(5)
      .select('deviceId tempC humidity ts')
      .lean();
    const hasReal = docs.some(d => d.deviceId && d.deviceId !== 'MANUAL-SETUP');
    res.json({ vialId: req.params.vialId, telemetry: docs, esp32Reached: hasReal });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** Blockchain mode for demo: get/set mock vs real (Sepolia). Demo toggle uses this. */
const chainService = require('./services/chain.service');
app.get('/api/blockchain-mode', (req, res) => {
  res.json({ useMock: chainService.getUseMockChain() });
});
app.post('/api/blockchain-mode', (req, res) => {
  const useMock = req.body && req.body.useMock;
  if (useMock !== undefined) {
    chainService.setUseMockChain(useMock);
    console.log('[blockchain-mode] useMock =', chainService.getUseMockChain());
  }
  res.json({ useMock: chainService.getUseMockChain() });
});

app.use('/dashboard', express.static(path.join(__dirname, 'dashboard')));
app.get('/dashboard', (req, res) => res.redirect('/dashboard/'));
app.get('/track/:vialId', (req, res) => res.sendFile(path.join(__dirname, 'dashboard', 'track.html')));
app.listen(port, '0.0.0.0', () => {
  console.log(`Example app listening on port ${port}! (all interfaces – ESP32 can connect via your PC's WiFi IP)`);
  const ifaces = os.networkInterfaces();
  Object.keys(ifaces).forEach((name) => {
    ifaces[name].forEach((iface) => {
      if (iface.family === 'IPv4' && !iface.internal) {
        console.log(`  → Use this URL for ESP32: http://${iface.address}:${port}`);
      }
    });
  });
});