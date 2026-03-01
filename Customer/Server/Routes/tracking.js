const express = require('express');
const router = express.Router();
const path = require('path');
const Shipment = require('../models/Shipment');
const Telemetry = require('../models/Telemetry');
const Event = require('../models/Event');
const { verifyChain } = require('../services/auditChain');

router.get('/:shipmentId', (req, res) => {
  res.sendFile('tracking.html', { root: path.join(__dirname, '..', 'public') });
});

router.get('/:shipmentId/data', async (req, res) => {
  try {
    const { shipmentId } = req.params;
    const shipment = await Shipment.findOne({ shipmentId });
    if (!shipment) return res.status(404).json({ error: 'Shipment not found' });

    const latestTelemetry = await Telemetry.findOne({ shipmentId }).sort({ ts: -1 });
    const events = await Event.find({ shipmentId }).sort({ createdAt: -1 });
    const chainVerification = await verifyChain(shipmentId);
    const telemetryHistory = await Telemetry.find({ shipmentId })
      .sort({ ts: -1 })
      .limit(50)
      .select('ts tempC humidity lat lng');

    res.json({
      shipment: {
        shipmentId: shipment.shipmentId,
        source: shipment.source,
        destination: shipment.destination,
        status: shipment.status,
        verdict: shipment.verdict,
        tempRange: { min: shipment.tempMin, max: shipment.tempMax },
        vaccineType: shipment.vaccineType,
        createdAt: shipment.createdAt,
        updatedAt: shipment.updatedAt
      },
      latestTelemetry: latestTelemetry ? {
        tempC: latestTelemetry.tempC,
        humidity: latestTelemetry.humidity,
        lat: latestTelemetry.lat,
        lng: latestTelemetry.lng,
        lidOpen: latestTelemetry.lidOpen,
        ts: latestTelemetry.ts
      } : null,
      violations: events.map(e => ({
        eventType: e.eventType,
        severity: e.severity,
        tsStart: e.tsStart,
        evidence: e.evidence,
        eventHash: e.eventHash,
        txHash: e.txHash,
        network: e.network,
        blockNumber: e.blockNumber
      })),
      chainVerification,
      telemetryHistory: telemetryHistory.reverse()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
