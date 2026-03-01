const axios = require('axios');

const activeSimulations = {};

const SCENARIOS = {
  normal: {
    name: 'Normal Trip',
    shipmentId: 'SHIP-DEMO-001',
    deviceId: 'SIM-01',
    durationSec: 30,
    intervalMs: 2000,
    route: [
      { lat: 19.0760, lng: 72.8777 },
      { lat: 19.0780, lng: 72.8800 },
      { lat: 19.0800, lng: 72.8830 },
      { lat: 19.0820, lng: 72.8850 },
      { lat: 19.0840, lng: 72.8870 }
    ],
    tempProfile: [
      { pct: 0, tempC: 5.0 },
      { pct: 0.5, tempC: 5.2 },
      { pct: 1, tempC: 5.1 }
    ],
    tamperEvents: [],
    routeDeviation: false
  },
  coldBreach: {
    name: 'Cold Chain Breach',
    shipmentId: 'SHIP-DEMO-002',
    deviceId: 'SIM-02',
    durationSec: 30,
    intervalMs: 2000,
    route: [
      { lat: 19.0760, lng: 72.8777 },
      { lat: 19.0780, lng: 72.8800 },
      { lat: 19.0800, lng: 72.8830 },
      { lat: 19.0820, lng: 72.8850 },
      { lat: 19.0840, lng: 72.8870 }
    ],
    tempProfile: [
      { pct: 0, tempC: 5.0 },
      { pct: 0.3, tempC: 5.5 },
      { pct: 0.4, tempC: 9.0 },
      { pct: 0.5, tempC: 12.0 },
      { pct: 0.6, tempC: 14.0 },
      { pct: 0.7, tempC: 10.0 },
      { pct: 0.8, tempC: 6.0 },
      { pct: 1, tempC: 5.0 }
    ],
    tamperEvents: [],
    routeDeviation: false
  },
  tamper: {
    name: 'Tamper + Route Deviation',
    shipmentId: 'SHIP-DEMO-003',
    deviceId: 'SIM-03',
    durationSec: 30,
    intervalMs: 2000,
    route: [
      { lat: 19.0760, lng: 72.8777 },
      { lat: 19.0780, lng: 72.8800 },
      { lat: 19.0800, lng: 72.8830 },
      { lat: 19.0820, lng: 72.8850 },
      { lat: 19.0840, lng: 72.8870 }
    ],
    tempProfile: [
      { pct: 0, tempC: 5.0 },
      { pct: 1, tempC: 5.5 }
    ],
    tamperEvents: [
      { pct: 0.4, lidOpen: true, durationPct: 0.15 }
    ],
    routeDeviation: true,
    deviationStart: 0.5,
    deviationEnd: 0.7,
    deviationOffset: { lat: 0.01, lng: 0.01 }
  }
};

function interpolate(profile, pct) {
  if (profile.length === 0) return 5.0;
  if (pct <= profile[0].pct) return profile[0].tempC;
  if (pct >= profile[profile.length - 1].pct) return profile[profile.length - 1].tempC;

  for (let i = 0; i < profile.length - 1; i++) {
    if (pct >= profile[i].pct && pct <= profile[i + 1].pct) {
      const ratio = (pct - profile[i].pct) / (profile[i + 1].pct - profile[i].pct);
      return profile[i].tempC + ratio * (profile[i + 1].tempC - profile[i].tempC);
    }
  }
  return profile[profile.length - 1].tempC;
}

function interpolateRoute(route, pct) {
  if (route.length === 0) return { lat: 0, lng: 0 };
  if (pct <= 0) return route[0];
  if (pct >= 1) return route[route.length - 1];

  const totalSegments = route.length - 1;
  const segment = Math.floor(pct * totalSegments);
  const segPct = (pct * totalSegments) - segment;

  const from = route[Math.min(segment, totalSegments)];
  const to = route[Math.min(segment + 1, totalSegments)];
  return {
    lat: from.lat + segPct * (to.lat - from.lat),
    lng: from.lng + segPct * (to.lng - from.lng)
  };
}

function buildPacket(scenario, pct) {
  const tempC = interpolate(scenario.tempProfile, pct) + (Math.random() - 0.5) * 0.3;
  const pos = interpolateRoute(scenario.route, pct);

  let lat = pos.lat;
  let lng = pos.lng;
  if (scenario.routeDeviation && pct >= scenario.deviationStart && pct <= scenario.deviationEnd) {
    lat += scenario.deviationOffset.lat;
    lng += scenario.deviationOffset.lng;
  }

  let lidOpen = false;
  for (const te of scenario.tamperEvents) {
    if (pct >= te.pct && pct <= te.pct + te.durationPct) {
      lidOpen = te.lidOpen;
    }
  }

  return {
    shipmentId: scenario.shipmentId,
    deviceId: scenario.deviceId,
    ts: new Date().toISOString(),
    tempC: Math.round(tempC * 10) / 10,
    humidity: Math.round((55 + Math.random() * 15) * 10) / 10,
    pressure: Math.round((1013 + Math.random() * 5) * 10) / 10,
    lat: Math.round(lat * 10000) / 10000,
    lng: Math.round(lng * 10000) / 10000,
    lidOpen,
    shock: 0,
    batteryV: Math.round((3.7 + Math.random() * 0.3) * 100) / 100
  };
}

function startSimulation(scenarioKey, backendUrl, ingestFn) {
  const scenario = SCENARIOS[scenarioKey];
  if (!scenario) throw new Error(`Unknown scenario: ${scenarioKey}`);

  if (activeSimulations[scenario.shipmentId]) {
    stopSimulation(scenario.shipmentId);
  }

  const totalPackets = Math.ceil(scenario.durationSec * 1000 / scenario.intervalMs);
  let packetIndex = 0;

  console.log(`[SIMULATOR] Starting "${scenario.name}" — ${totalPackets} packets over ${scenario.durationSec}s`);

  const timer = setInterval(async () => {
    if (packetIndex >= totalPackets) {
      stopSimulation(scenario.shipmentId);
      console.log(`[SIMULATOR] "${scenario.name}" completed`);
      return;
    }

    const pct = packetIndex / totalPackets;
    const packet = buildPacket(scenario, pct);

    try {
      if (ingestFn) {
        await ingestFn(packet);
      } else {
        await axios.post(`${backendUrl}/iot/telemetry`, packet);
      }
    } catch (err) {
      console.error(`[SIMULATOR] Send failed: ${err.message}`);
    }

    packetIndex++;
  }, scenario.intervalMs);

  activeSimulations[scenario.shipmentId] = {
    timer,
    scenario: scenarioKey,
    name: scenario.name,
    startedAt: new Date(),
    totalPackets,
    shipmentId: scenario.shipmentId
  };

  return {
    shipmentId: scenario.shipmentId,
    scenarioName: scenario.name,
    totalPackets,
    durationSec: scenario.durationSec,
    intervalMs: scenario.intervalMs
  };
}

function stopSimulation(shipmentId) {
  const sim = activeSimulations[shipmentId];
  if (sim) {
    clearInterval(sim.timer);
    delete activeSimulations[shipmentId];
    console.log(`[SIMULATOR] Stopped ${shipmentId}`);
    return true;
  }
  return false;
}

function getActiveSimulations() {
  const result = {};
  for (const [id, sim] of Object.entries(activeSimulations)) {
    result[id] = { scenario: sim.scenario, name: sim.name, startedAt: sim.startedAt };
  }
  return result;
}

function getScenarioList() {
  return Object.entries(SCENARIOS).map(([key, s]) => ({
    key,
    name: s.name,
    shipmentId: s.shipmentId,
    durationSec: s.durationSec
  }));
}

module.exports = { startSimulation, stopSimulation, getActiveSimulations, getScenarioList, SCENARIOS };
