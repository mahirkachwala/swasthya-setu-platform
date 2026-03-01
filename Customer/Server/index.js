const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;

const dbAppRoute = require('./Routes/dbApp');
const chatBotRoute = require('./Routes/chatbot');
const webAppRoute = require('./Routes/webServer');
const iotRoute = require('./Routes/iot');
const simulatorRoute = require('./Routes/simulatorRoute');
const trackingRoute = require('./Routes/tracking');
const chainRoute = require('./Routes/chain');
const aiRoute = require('./Routes/ai');
const customerRoute = require('./Routes/customer');
const apiRoute = require('./Routes/api');

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE");
    return res.status(200).json({});
  }
  next();
});
app.use(express.json({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => res.redirect('/citizen'));
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});
app.get('/customer', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'customer.html'));
});
app.get('/citizen', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'citizen.html'));
});
app.get('/doctor', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'doctor-app.html'));
});

app.use('/database', dbAppRoute);
app.use('/chatbot', chatBotRoute);
app.use('/app', webAppRoute);
app.use('/iot', iotRoute);
app.use('/simulator', simulatorRoute);
app.use('/track', trackingRoute);
app.use('/chain', chainRoute);
app.use('/ai', aiRoute);
app.use('/customer', customerRoute);
app.use('/api', apiRoute);

app.get('/api/vaccine/:shipmentId', async (req, res) => {
  try {
    const Shipment = require('./models/Shipment');
    const Telemetry = require('./models/Telemetry');
    const Event = require('./models/Event');
    const { verifyChain } = require('./services/auditChain');

    const shipment = await Shipment.findOne({ shipmentId: req.params.shipmentId });
    if (!shipment) return res.status(404).json({ error: 'Shipment not found' });

    const latest = await Telemetry.findOne({ shipmentId: req.params.shipmentId }).sort({ ts: -1 });
    const events = await Event.find({ shipmentId: req.params.shipmentId }).sort({ createdAt: -1 });
    const verification = await verifyChain(req.params.shipmentId);

    res.json({
      status: shipment.verdict,
      shipment: {
        shipmentId: shipment.shipmentId,
        source: shipment.source,
        destination: shipment.destination,
        tempRange: `${shipment.tempMin}-${shipment.tempMax}°C`
      },
      latestTelemetry: latest,
      violationHistory: events,
      blockchainProof: verification,
      verificationURL: `/track/${req.params.shipmentId}`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port", PORT);
  console.log(`Dashboard: http://localhost:${PORT}/dashboard`);
  console.log(`API docs: /iot, /simulator, /track, /chain, /ai`);
});
