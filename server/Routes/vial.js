const express = require('express');
const router = express.Router();
const Telemetry = require('../models/Telemetry');
const Event = require('../models/Event');
const Shipment = require('../models/Shipment');
const auditService = require('../services/audit.service');

/**
 * GET /api/vial/:vialId
 * Full vial data for QR scan - origin, route, temp history, events, blockchain proof.
 */
router.get('/:vialId', async (req, res) => {
  const { vialId } = req.params;
  try {
    const shipment = await Shipment.findOne({ shipmentId: vialId }).lean();
    // Prefer real device over seed (MANUAL-SETUP) so ESP32 data shows when connected
    let latest = await Telemetry.findOne({ shipmentId: vialId, deviceId: { $ne: 'MANUAL-SETUP' } }).sort({ ts: -1, _id: -1 }).lean();
    if (!latest) latest = await Telemetry.findOne({ shipmentId: vialId }).sort({ ts: -1, _id: -1 }).lean();
    const firstTelemetry = await Telemetry.findOne({ shipmentId: vialId }).sort({ ts: 1 }).select('ts').lean();
    const history = await Telemetry.find({ shipmentId: vialId }).sort({ ts: 1 }).select('ts tempC humidity pressurePa lat lng coldChainViolation tamperViolation routeViolation pressureViolation').lean();
    const events = await Event.find({ shipmentId: vialId }).sort({ tsStart: -1 }).lean();
    const audit = await auditService.getAuditChain(vialId);

    const breachTypes = ['COLD_CHAIN_BREACH', 'TAMPER_LID_OPEN', 'TAMPER_SHOCK', 'PRESSURE_ANOMALY', 'ROUTE_DEVIATION'];
    const hasBreach = events.some(e => breachTypes.includes(e.eventType));
    const usable = !hasBreach;
    const departedAt = firstTelemetry ? firstTelemetry.ts : null;

    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    res.set('Pragma', 'no-cache');
    return res.json({
      vialId,
      shipment,
      latest,
      departedAt,
      history,
      events,
      audit,
      usable,
      qrUrl: `/track/${vialId}`,
    });
  } catch (err) {
    console.error('[vial]', err);
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    res.set('Pragma', 'no-cache');
    return res.status(200).json({
      vialId,
      shipment: null,
      latest: null,
      departedAt: null,
      history: [],
      events: [],
      audit: [],
      usable: true,
      qrUrl: `/track/${vialId}`,
      error: 'Database unavailable. Start MongoDB and Server.',
    });
  }
});

module.exports = router;
