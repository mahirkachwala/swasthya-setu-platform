const express = require('express');
const router = express.Router();
const simulator = require('../services/simulator');
const Shipment = require('../models/Shipment');

router.get('/scenarios', (req, res) => {
  res.json({ scenarios: simulator.getScenarioList() });
});

router.post('/start', express.json(), async (req, res) => {
  try {
    const { scenario } = req.body;
    if (!scenario) return res.status(400).json({ error: 'scenario required (normal, coldBreach, tamper)' });

    const scenarioData = simulator.SCENARIOS[scenario];
    if (!scenarioData) return res.status(400).json({ error: `Unknown scenario: ${scenario}` });

    let shipment = await Shipment.findOne({ shipmentId: scenarioData.shipmentId });
    if (!shipment) {
      const route = scenarioData.route;
      const lats = route.map(r => r.lat);
      const lngs = route.map(r => r.lng);

      shipment = new Shipment({
        shipmentId: scenarioData.shipmentId,
        deviceId: scenarioData.deviceId,
        source: 'Simulation Origin',
        destination: 'Simulation Destination',
        status: 'IN_TRANSIT',
        verdict: 'SAFE',
        geofence: {
          type: 'BBOX',
          minLat: Math.min(...lats) - 0.005,
          maxLat: Math.max(...lats) + 0.005,
          minLng: Math.min(...lngs) - 0.005,
          maxLng: Math.max(...lngs) + 0.005
        },
        route
      });
      await shipment.save();
    } else {
      shipment.status = 'IN_TRANSIT';
      shipment.verdict = 'SAFE';
      shipment.violations = [];
      shipment.latestTelemetry = null;
      await shipment.save();
    }

    const port = process.env.PORT || 5000;
    const backendUrl = `http://127.0.0.1:${port}`;
    const result = simulator.startSimulation(scenario, backendUrl);

    res.json({ started: true, ...result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/stop', express.json(), (req, res) => {
  const { shipmentId } = req.body;
  if (!shipmentId) return res.status(400).json({ error: 'shipmentId required' });
  const stopped = simulator.stopSimulation(shipmentId);
  res.json({ stopped });
});

router.get('/active', (req, res) => {
  res.json({ simulations: simulator.getActiveSimulations() });
});

module.exports = router;
