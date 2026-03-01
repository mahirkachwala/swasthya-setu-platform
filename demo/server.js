const express = require('express');
const path = require('path');
const fetch = require('node-fetch');
const scenariosPath = path.join(__dirname, 'scenarios');
const { setScenariosDir, loadScenario, listScenarios } = require('./scenarios/index.js');
setScenariosDir(scenariosPath); // always use demo-control/scenarios relative to this server.js
const { runScenario } = require('./runScenario.js');

const app = express();
const PORT = process.env.PORT || 5000;
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';
const DOCTOR_DISPLAY_URL = process.env.DOCTOR_DISPLAY_URL || 'http://localhost:5001';

// CORS so the page works when opened from file:// or another port
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

async function proxyToBackend(req, res, pathname, query = '') {
  try {
    const url = `${BACKEND_URL}${pathname}${query}`;
    const r = await fetch(url, { headers: req.headers });
    const data = await r.json().catch(() => ({}));
    res.status(r.status).json(data);
  } catch (e) {
    res.status(502).json({ error: 'Backend unavailable: ' + e.message });
  }
}

app.get('/api/config', (req, res) => {
  res.json({
    backendUrl: BACKEND_URL,
    doctorDisplayUrl: 'http://localhost:' + PORT,
  });
});

app.get('/api/vial/:vialId', (req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  proxyToBackend(req, res, '/api/vial/' + encodeURIComponent(req.params.vialId));
});

// Vial IDs for matrix: 1=geofence, 2=pressure, 3=manual (ESP32)
const VIAL_IDS = ['VIAL-001', 'VIAL-002', 'VIAL-003'];
app.get('/api/vials', (req, res) => {
  res.json({ vials: VIAL_IDS });
});

app.get('/api/scenarios', (req, res) => {
  try {
    const list = listScenarios();
    res.json({ scenarios: list });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/scenarios/:id', (req, res) => {
  const s = loadScenario(req.params.id);
  if (!s) return res.status(404).json({ error: 'Scenario not found' });
  res.json(s);
});

app.post('/api/run', (req, res) => {
  const body = req.body || {};
  const { scenarioId, backendUrl } = body;
  const id = (scenarioId || body.id || '').trim();
  if (id === 'demo_manual') {
    const confirmed = (req.headers['x-confirm-manual'] || '').toString() === '1';
    if (!confirmed) {
      console.log('[api/run] Rejected: manual scenario must be started explicitly from the demo page (select it and click Start simulation).');
      return res.status(400).json({ error: 'Manual (ESP32) scenario must be started explicitly. Select "3. Manual" in the dropdown and click Start simulation.', id: 'demo_manual' });
    }
  }
  console.log('[api/run] request body:', JSON.stringify({ scenarioId: body.scenarioId, id }));
  const scenario = loadScenario(id);
  if (!scenario) {
    console.error('[api/run] Scenario not found:', id, '(scenarios dir:', path.join(__dirname, 'scenarios') + ')');
    return res.status(404).json({ error: 'Scenario not found', id });
  }
  const targetBackend = backendUrl || BACKEND_URL;
  setImmediate(() => {
    runScenario(scenario, targetBackend).catch((err) =>
      console.error('[runScenario]', err)
    );
  });
  res.json({
    started: true,
    scenarioId: scenario.id || id,
    shipmentId: scenario.shipmentId,
    durationSec: (scenario.durationSec !== undefined && scenario.durationSec !== null) ? Number(scenario.durationSec) : 0,
    timeline: scenario.timeline || [],
    doctorTrackUrl: `${DOCTOR_DISPLAY_URL.replace(/\/$/, '')}/track/${scenario.shipmentId}`,
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Demo Control running at http://localhost:${PORT}`);
  console.log(`Backend: ${BACKEND_URL} | Doctor display: ${DOCTOR_DISPLAY_URL}`);
  try {
    const list = listScenarios();
    const ids = (list || []).map(s => s.id);
    console.log('Scenarios loaded:', ids.length ? ids.join(', ') : 'none (run from demo-control folder)');
  } catch (e) {
    console.error('Scenarios failed to load:', e.message);
  }
});
