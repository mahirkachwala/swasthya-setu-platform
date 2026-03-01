/**
 * IoT alert engine: cold chain, tamper, geofence.
 * Geofence: simple bounding box for MVP.
 */
const Telemetry = require('../models/Telemetry');
const Event = require('../models/Event');
const Shipment = require('../models/Shipment');
const auditService = require('./audit.service');
const chainService = require('./chain.service');

const TEMP_MIN = 2;
const TEMP_MAX = 8;
const PRESSURE_MIN = 900;
const PRESSURE_MAX = 1100;

// Debounce: one event per 10s window so readings are point-wise (every 10s). Matches 10s telemetry interval.
const lastEventByShipment = new Map();
const DEBOUNCE_MS = 60000;
const DEBOUNCE_COLD_CHAIN_MS = 10000;

function shouldCreateEvent(shipmentId, eventType) {
  const key = `${shipmentId}:${eventType}`;
  const last = lastEventByShipment.get(key);
  const now = Date.now();
  const ms = eventType === 'COLD_CHAIN_BREACH' ? DEBOUNCE_COLD_CHAIN_MS : DEBOUNCE_MS;
  if (last && now - last < ms) return false;
  lastEventByShipment.set(key, now);
  return true;
}

async function processTelemetry(packet, geofence) {
  const rawTs = packet.ts ? new Date(packet.ts) : new Date();
  const ts = isNaN(rawTs.getTime()) ? new Date() : rawTs;
  const doc = await Telemetry.create({
    shipmentId: packet.shipmentId,
    deviceId: packet.deviceId,
    ts,
    tempC: packet.tempC,
    humidity: packet.humidity,
    lat: packet.lat,
    lng: packet.lng,
    speedKmph: packet.speedKmph,
    lidOpen: packet.lidOpen || false,
    shock: packet.shock || 0,
    pressurePa: packet.pressurePa,
    batteryV: packet.batteryV,
  });

  const tempMin = packet.tempMin != null ? packet.tempMin : TEMP_MIN;
  const tempMax = packet.tempMax != null ? packet.tempMax : TEMP_MAX;
  let coldChainViolation = packet.tempC < tempMin || packet.tempC > tempMax;
  let tamperViolation = packet.lidOpen === true || (packet.shock && packet.shock > 0);
  let pressureViolation = packet.pressurePa != null && (packet.pressurePa < PRESSURE_MIN || packet.pressurePa > PRESSURE_MAX);
  let routeViolation = false;

  if (geofence && geofence.type === 'BBOX' && packet.lat != null && packet.lng != null) {
    const { minLat, maxLat, minLng, maxLng } = geofence;
    routeViolation = packet.lat < minLat || packet.lat > maxLat || packet.lng < minLng || packet.lng > maxLng;
  }

  doc.coldChainViolation = coldChainViolation;
  doc.tamperViolation = tamperViolation;
  doc.pressureViolation = pressureViolation;
  doc.routeViolation = routeViolation;
  await doc.save();

  const hasAnyBreach = coldChainViolation || tamperViolation || pressureViolation || routeViolation;
  await Shipment.findOneAndUpdate(
    { shipmentId: packet.shipmentId },
    { $set: { lastTelemetryAt: ts, status: hasAnyBreach ? 'ALERT' : 'ACTIVE' } },
    { upsert: true }
  );

  const events = [];

  if (coldChainViolation && shouldCreateEvent(packet.shipmentId, 'COLD_CHAIN_BREACH')) {
    const ev = await createAndRecordEvent(packet.shipmentId, 'COLD_CHAIN_BREACH', {
      tempC: packet.tempC, // actual reading from device (ESP32/sensor), never hardcoded
      minTemp: tempMin,
      maxTemp: tempMax,
    });
    events.push(ev);
  }

  if (tamperViolation) {
    const evType = packet.lidOpen ? 'TAMPER_LID_OPEN' : 'TAMPER_SHOCK';
    if (shouldCreateEvent(packet.shipmentId, evType)) {
      const ev = await createAndRecordEvent(packet.shipmentId, evType, {
        lidOpen: packet.lidOpen,
        shock: packet.shock,
      });
      events.push(ev);
    }
  }

  if (pressureViolation && shouldCreateEvent(packet.shipmentId, 'PRESSURE_ANOMALY')) {
    const ev = await createAndRecordEvent(packet.shipmentId, 'PRESSURE_ANOMALY', {
      pressurePa: packet.pressurePa,
      min: PRESSURE_MIN,
      max: PRESSURE_MAX,
    });
    events.push(ev);
  }

  if (routeViolation && shouldCreateEvent(packet.shipmentId, 'ROUTE_DEVIATION')) {
    const ev = await createAndRecordEvent(packet.shipmentId, 'ROUTE_DEVIATION', {
      lat: packet.lat,
      lng: packet.lng,
      geofence,
    });
    events.push(ev);
  }

  return { doc, events };
}

async function createAndRecordEvent(shipmentId, eventType, evidence) {
  const ts = new Date().toISOString();
  const eventPayload = { shipmentId, eventType, tsStart: ts, tsEnd: ts, evidence };
  const eventHash = auditService.computeEventHash(eventPayload);

  await auditService.appendAudit(shipmentId, eventType, eventPayload);

  const chainResult = await chainService.recordEvent(shipmentId, eventHash, eventType, ts, { evidence, timestampISO: ts });

  const ev = await Event.create({
    shipmentId,
    eventType,
    severity: 'HIGH',
    tsStart: ts,
    tsEnd: ts,
    evidence,
    eventHash,
    txHash: chainResult.txHash,
    blockNumber: chainResult.blockNumber,
    network: chainResult.network,
  });

  return ev;
}

module.exports = { processTelemetry, TEMP_MIN, TEMP_MAX };
