const express = require('express');
const router = express.Router();
const Telemetry = require('../models/Telemetry');
const Event = require('../models/Event');
const Shipment = require('../models/Shipment');
const auditService = require('../services/audit.service');
const iotService = require('../services/iot.service');
const logBuffer = require('../services/logBuffer');

// Default geofence for demo (Mumbai area). Simulator can override via header.
const DEFAULT_GEOFENCE = {
  type: 'BBOX',
  minLat: 19.0,
  maxLat: 19.2,
  minLng: 72.8,
  maxLng: 73.0,
};

/**
 * POST /iot/telemetry
 * Accepts sensor packets from simulator or real device.
 * Body: { shipmentId, deviceId, ts, tempC, humidity, lat, lng, lidOpen, shock, batteryV, ... }
 */
router.post('/telemetry', async (req, res) => {
  try {
    const packet = req.body || {};
    const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || req.connection?.remoteAddress || '?';
    const fromRealDevice = packet.deviceId && packet.deviceId !== 'MANUAL-SETUP';
    console.log('[iot/telemetry] from', clientIp, packet.shipmentId, 'deviceId=' + (packet.deviceId || '?'), 'tempC=' + packet.tempC, fromRealDevice ? '<-- REAL DEVICE (ESP32)' : '(seed)');
    const geofence = req.headers['x-geofence'] ? JSON.parse(req.headers['x-geofence']) : DEFAULT_GEOFENCE;

    if (!packet.shipmentId || !packet.deviceId || packet.tempC == null) {
      console.log('[iot/telemetry] REJECTED: missing shipmentId, deviceId, or tempC');
      return res.status(400).json({ error: 'Missing required fields: shipmentId, deviceId, tempC' });
    }

    const { doc, events } = await iotService.processTelemetry(packet, geofence);

    const violations = {
      coldChain: doc.coldChainViolation,
      tamper: doc.tamperViolation,
      route: doc.routeViolation,
    };
    const telemetrySummary = [packet.shipmentId, 'temp=' + packet.tempC + '°C'];
    if (packet.humidity != null) telemetrySummary.push('hum=' + packet.humidity + '%');
    if (packet.pressurePa != null) telemetrySummary.push('press=' + packet.pressurePa);
    if (packet.lat != null && packet.lng != null) telemetrySummary.push('lat=' + packet.lat.toFixed(4), 'lng=' + packet.lng.toFixed(4));
    logBuffer.add('TELEMETRY', telemetrySummary.join(' '), {
      shipmentId: packet.shipmentId,
      deviceId: packet.deviceId,
      tempC: packet.tempC,
      humidity: packet.humidity,
      pressurePa: packet.pressurePa,
      lat: packet.lat,
      lng: packet.lng,
      violations,
    });
    events.forEach((ev) => {
      let eventMsg = packet.shipmentId + ' ' + ev.eventType;
      const evd = ev.evidence || {};
      if (ev.eventType === 'ROUTE_DEVIATION' && evd.lat != null && evd.lng != null) eventMsg += ' at ' + evd.lat.toFixed(4) + ',' + evd.lng.toFixed(4);
      else if (ev.eventType === 'PRESSURE_ANOMALY' && evd.pressurePa != null) eventMsg += ' ' + evd.pressurePa + ' hPa';
      else if (ev.eventType === 'COLD_CHAIN_BREACH' && evd.tempC != null) eventMsg += ' ' + evd.tempC + '°C';
      logBuffer.add('EVENT', eventMsg, {
        shipmentId: packet.shipmentId,
        eventType: ev.eventType,
        evidence: ev.evidence,
        txHash: ev.txHash,
        network: ev.network,
      });
    });

    res.status(201).json({
      ok: true,
      telemetryId: doc._id,
      eventsCreated: events.length,
      violations: {
        coldChain: doc.coldChainViolation,
        tamper: doc.tamperViolation,
        route: doc.routeViolation,
      },
    });
  } catch (err) {
    console.error('[iot/telemetry]', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /iot/shipment/:shipmentId/latest
 * Returns latest telemetry + recent events for dashboard.
 */
router.get('/shipment/:shipmentId/latest', async (req, res) => {
  try {
    const { shipmentId } = req.params;
    // Prefer real device over seed (MANUAL-SETUP) so ESP32 data shows when connected
    let latest = await Telemetry.findOne({ shipmentId, deviceId: { $ne: 'MANUAL-SETUP' } }).sort({ ts: -1, _id: -1 }).lean();
    if (!latest) latest = await Telemetry.findOne({ shipmentId }).sort({ ts: -1, _id: -1 }).lean();
    const recentEvents = await Event.find({ shipmentId }).sort({ tsStart: -1 }).limit(10).lean();
    const shipment = await Shipment.findOne({ shipmentId }).lean();

    res.json({
      shipmentId,
      shipment,
      latest,
      recentEvents,
    });
  } catch (err) {
    console.error('[iot/shipment/latest]', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /iot/shipment/:shipmentId/history
 * Returns telemetry history for charts (temperature over time, etc.).
 */
router.get('/shipment/:shipmentId/history', async (req, res) => {
  try {
    const { shipmentId } = req.params;
    const limit = Math.min(parseInt(req.query.limit) || 500, 1000);
    const history = await Telemetry.find({ shipmentId })
      .sort({ ts: 1 })
      .limit(limit)
      .select('ts tempC humidity lat lng coldChainViolation tamperViolation routeViolation')
      .lean();

    res.json({ shipmentId, history });
  } catch (err) {
    console.error('[iot/shipment/history]', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /iot/shipment/:shipmentId/audit
 * Returns hash-chained audit log (tamper-evident ledger).
 */
router.get('/shipment/:shipmentId/audit', async (req, res) => {
  try {
    const { shipmentId } = req.params;
    const chain = await auditService.getAuditChain(shipmentId);
    res.json({ shipmentId, chain });
  } catch (err) {
    console.error('[iot/shipment/audit]', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /iot/shipments
 * List all shipments (for dashboard dropdown).
 */
router.get('/shipments', async (req, res) => {
  try {
    const shipments = await Shipment.find({}).sort({ lastTelemetryAt: -1 }).lean();
    res.json({ shipments });
  } catch (err) {
    console.error('[iot/shipments]', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
