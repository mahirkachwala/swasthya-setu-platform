const express = require('express');
const router = express.Router();
const Telemetry = require('../models/Telemetry');
const Shipment = require('../models/Shipment');
const Event = require('../models/Event');
const ruleEngine = require('../services/ruleEngine');
const { getAuditTrail, verifyChain } = require('../services/auditChain');

router.post('/telemetry', express.json(), async (req, res) => {
  try {
    const { shipmentId, deviceId, ts, tempC, humidity, pressure, lat, lng, lidOpen, shock, batteryV } = req.body;

    if (!shipmentId || tempC == null) {
      return res.status(400).json({ error: 'shipmentId and tempC are required' });
    }

    let shipment = await Shipment.findOne({ shipmentId });
    if (!shipment) {
      shipment = new Shipment({
        shipmentId,
        deviceId: deviceId || 'UNKNOWN',
        source: 'Auto-created',
        destination: 'Auto-created',
        status: 'IN_TRANSIT',
        geofence: {
          type: 'BBOX',
          minLat: (lat || 19.07) - 0.02,
          maxLat: (lat || 19.07) + 0.02,
          minLng: (lng || 72.87) - 0.02,
          maxLng: (lng || 72.87) + 0.02
        }
      });
      await shipment.save();
      console.log(`[IOT] Auto-created shipment: ${shipmentId}`);
    }

    const telemetry = new Telemetry({
      shipmentId,
      deviceId: deviceId || shipment.deviceId || 'UNKNOWN',
      ts: ts ? new Date(ts) : new Date(),
      tempC,
      humidity: humidity || null,
      pressure: pressure || null,
      lat: lat || null,
      lng: lng || null,
      lidOpen: lidOpen || false,
      shock: shock || 0,
      batteryV: batteryV || null
    });

    const events = await ruleEngine.evaluate(telemetry, shipment);
    await telemetry.save();

    shipment.latestTelemetry = {
      tempC, humidity, lat, lng, lidOpen, shock, ts: telemetry.ts
    };
    shipment.updatedAt = new Date();
    await shipment.save();

    res.json({
      stored: true,
      shipmentId,
      violations: events.map(e => ({ type: e.eventType, severity: e.severity, hash: e.eventHash })),
      currentVerdict: shipment.verdict
    });
  } catch (err) {
    console.error('[IOT] Telemetry error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.post('/register-device', express.json(), async (req, res) => {
  try {
    const { deviceId, shipmentId } = req.body;
    if (!deviceId || !shipmentId) {
      return res.status(400).json({ error: 'deviceId and shipmentId required' });
    }

    let shipment = await Shipment.findOne({ shipmentId });
    if (shipment) {
      shipment.deviceId = deviceId;
      await shipment.save();
    }

    res.json({ registered: true, deviceId, shipmentId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/shipment/:shipmentId/latest', async (req, res) => {
  try {
    const shipment = await Shipment.findOne({ shipmentId: req.params.shipmentId });
    if (!shipment) return res.status(404).json({ error: 'Shipment not found' });

    const latestTelemetry = await Telemetry.findOne({ shipmentId: req.params.shipmentId }).sort({ ts: -1 });
    const recentEvents = await Event.find({ shipmentId: req.params.shipmentId }).sort({ createdAt: -1 }).limit(10);

    res.json({
      shipment: {
        shipmentId: shipment.shipmentId,
        source: shipment.source,
        destination: shipment.destination,
        status: shipment.status,
        verdict: shipment.verdict,
        tempRange: `${shipment.tempMin}–${shipment.tempMax}°C`,
        createdAt: shipment.createdAt,
        updatedAt: shipment.updatedAt
      },
      latestTelemetry: latestTelemetry || null,
      recentEvents: recentEvents.map(e => ({
        eventType: e.eventType,
        severity: e.severity,
        tsStart: e.tsStart,
        evidence: e.evidence,
        eventHash: e.eventHash,
        txHash: e.txHash,
        network: e.network,
        blockNumber: e.blockNumber
      })),
      ruleState: ruleEngine.getState(req.params.shipmentId)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/shipment/:shipmentId/history', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 200;
    const telemetry = await Telemetry.find({ shipmentId: req.params.shipmentId })
      .sort({ ts: -1 })
      .limit(limit)
      .select('ts tempC humidity lat lng lidOpen shock coldChainViolation tamperViolation routeViolation');

    res.json({ shipmentId: req.params.shipmentId, count: telemetry.length, telemetry: telemetry.reverse() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/shipment/:shipmentId/audit', async (req, res) => {
  try {
    const trail = await getAuditTrail(req.params.shipmentId);
    const verification = await verifyChain(req.params.shipmentId);
    const events = await Event.find({ shipmentId: req.params.shipmentId }).sort({ createdAt: 1 });

    res.json({
      shipmentId: req.params.shipmentId,
      chainVerification: verification,
      auditTrail: trail,
      events: events.map(e => ({
        eventType: e.eventType,
        severity: e.severity,
        tsStart: e.tsStart,
        eventHash: e.eventHash,
        txHash: e.txHash,
        network: e.network,
        blockNumber: e.blockNumber
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/shipments', async (req, res) => {
  try {
    const shipments = await Shipment.find({}).sort({ updatedAt: -1 });
    res.json(shipments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/shipment', express.json(), async (req, res) => {
  try {
    const { shipmentId, source, destination, tempMin, tempMax, deviceId, geofence, route } = req.body;
    if (!shipmentId || !source || !destination) {
      return res.status(400).json({ error: 'shipmentId, source, and destination required' });
    }

    const existing = await Shipment.findOne({ shipmentId });
    if (existing) return res.status(409).json({ error: 'Shipment already exists' });

    const shipment = new Shipment({
      shipmentId,
      source,
      destination,
      deviceId: deviceId || null,
      tempMin: tempMin || 2,
      tempMax: tempMax || 8,
      geofence: geofence || null,
      route: route || []
    });
    await shipment.save();
    res.json({ created: true, shipment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
