const Event = require('../models/Event');
const Shipment = require('../models/Shipment');
const { hashEvent, appendAuditLog } = require('./auditChain');
const blockchainService = require('./blockchain');

const shipmentState = {};

function getState(shipmentId) {
  if (!shipmentState[shipmentId]) {
    shipmentState[shipmentId] = {
      coldChain: 'OK',
      tamper: 'OK',
      route: 'OK',
      breachStart: null,
      breachTemps: []
    };
  }
  return shipmentState[shipmentId];
}

function checkColdChain(tempC, shipment) {
  const min = shipment.tempMin || 2;
  const max = shipment.tempMax || 8;
  return tempC < min || tempC > max;
}

function checkTamper(lidOpen, shock) {
  return lidOpen === true || shock >= 1;
}

function checkGeofence(lat, lng, shipment) {
  if (!shipment.geofence || !shipment.geofence.minLat) return false;
  const g = shipment.geofence;
  return lat < g.minLat || lat > g.maxLat || lng < g.minLng || lng > g.maxLng;
}

async function createViolationEvent(shipmentId, eventType, severity, evidence, ts) {
  const eventObj = {
    shipmentId,
    eventType,
    severity,
    tsStart: ts,
    evidence
  };

  const eventHashValue = hashEvent(eventObj);

  const event = new Event({
    ...eventObj,
    eventHash: eventHashValue
  });
  await event.save();

  await appendAuditLog(shipmentId, eventType, { ...eventObj, eventHash: eventHashValue });

  try {
    const chainResult = await blockchainService.recordEvent(shipmentId, eventHashValue, eventType, ts);
    if (chainResult && chainResult.txHash) {
      event.txHash = chainResult.txHash;
      event.blockNumber = chainResult.blockNumber;
      event.network = chainResult.network;
      await event.save();
    }
  } catch (err) {
    console.log(`Blockchain write skipped: ${err.message}`);
  }

  await Shipment.findOneAndUpdate(
    { shipmentId },
    {
      verdict: 'UNSAFE',
      status: 'UNSAFE',
      $push: { violations: event._id },
      updatedAt: new Date()
    }
  );

  console.log(`[RULE ENGINE] ${eventType} for ${shipmentId} — hash: ${eventHashValue.substring(0, 16)}...`);
  return event;
}

async function evaluate(telemetryDoc, shipment) {
  const state = getState(telemetryDoc.shipmentId);
  const events = [];
  const ts = telemetryDoc.ts || new Date();

  if (checkColdChain(telemetryDoc.tempC, shipment)) {
    telemetryDoc.coldChainViolation = true;
    if (state.coldChain === 'OK') {
      state.coldChain = 'BREACH';
      state.breachStart = ts;
      state.breachTemps = [telemetryDoc.tempC];
      const event = await createViolationEvent(
        telemetryDoc.shipmentId,
        'COLD_CHAIN_BREACH',
        'HIGH',
        { maxTemp: telemetryDoc.tempC, minTemp: telemetryDoc.tempC, lidOpen: telemetryDoc.lidOpen },
        ts
      );
      events.push(event);
    } else {
      state.breachTemps.push(telemetryDoc.tempC);
    }
  } else {
    if (state.coldChain === 'BREACH') {
      state.coldChain = 'OK';
      state.breachStart = null;
      state.breachTemps = [];
    }
  }

  if (checkTamper(telemetryDoc.lidOpen, telemetryDoc.shock)) {
    telemetryDoc.tamperViolation = true;
    if (state.tamper === 'OK') {
      state.tamper = 'BREACH';
      const eventType = telemetryDoc.lidOpen ? 'TAMPER_LID_OPEN' : 'TAMPER_SHOCK';
      const event = await createViolationEvent(
        telemetryDoc.shipmentId,
        eventType,
        'CRITICAL',
        { lidOpen: telemetryDoc.lidOpen, shock: telemetryDoc.shock },
        ts
      );
      events.push(event);
    }
  } else {
    state.tamper = 'OK';
  }

  if (telemetryDoc.lat != null && telemetryDoc.lng != null) {
    if (checkGeofence(telemetryDoc.lat, telemetryDoc.lng, shipment)) {
      telemetryDoc.routeViolation = true;
      if (state.route === 'OK') {
        state.route = 'BREACH';
        const event = await createViolationEvent(
          telemetryDoc.shipmentId,
          'ROUTE_DEVIATION',
          'MEDIUM',
          { lat: telemetryDoc.lat, lng: telemetryDoc.lng },
          ts
        );
        events.push(event);
      }
    } else {
      state.route = 'OK';
    }
  }

  return events;
}

module.exports = { evaluate, getState };
