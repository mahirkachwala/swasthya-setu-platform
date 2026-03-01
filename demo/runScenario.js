/**
 * Run a single scenario: interpolate route + temp, POST to backend with tempMin/tempMax.
 * Used by demo-control server when user clicks "Run simulation".
 */
const http = require('http');
const https = require('https');

function interpolate(profile, tSec) {
  const sorted = [...(profile || [])].sort((a, b) => a.tSec - b.tSec);
  if (sorted.length === 0) return { tempC: 24 };
  if (tSec <= sorted[0].tSec) return sorted[0];
  for (let i = 0; i < sorted.length - 1; i++) {
    if (tSec >= sorted[i].tSec && tSec <= sorted[i + 1].tSec) {
      const a = sorted[i], b = sorted[i + 1];
      const t = (tSec - a.tSec) / (b.tSec - a.tSec);
      return { tempC: a.tempC + t * (b.tempC - a.tempC) };
    }
  }
  return sorted[sorted.length - 1];
}

function interpolateRoute(route, tSec, totalSec) {
  if (!route || route.length < 2) return { lat: 19.076, lng: 72.8777 };
  const progress = Math.min(1, tSec / totalSec);
  const idx = progress * (route.length - 1);
  const i = Math.floor(idx), j = Math.min(i + 1, route.length - 1);
  const t = idx - i;
  const a = route[i], b = route[j];
  return {
    lat: a.lat + t * (b.lat - a.lat),
    lng: a.lng + t * (b.lng - a.lng),
  };
}

function getEventForTime(events, tSec) {
  for (const e of events || []) {
    if (e.type === 'LID_OPEN' && tSec >= e.tSec && tSec < e.tSec + (e.durationSec || 30))
      return { lidOpen: true };
    if (e.type === 'ROUTE_DEVIATION' && tSec >= e.tSec)
      return { routeDeviation: true };
  }
  return {};
}

function post(url, body, geofence) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const lib = u.protocol === 'https:' ? https : http;
    const data = JSON.stringify(body);
    const req = lib.request({
      hostname: u.hostname,
      port: u.port || (u.protocol === 'https:' ? 443 : 80),
      path: u.pathname + u.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        ...(geofence && { 'x-geofence': JSON.stringify(geofence) }),
      },
    }, (res) => {
      let buf = '';
      res.on('data', (c) => { buf += c; });
      res.on('end', () => {
        try { resolve(JSON.parse(buf)); } catch (e) { resolve(null); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function runScenario(scenario, backendUrl, onProgress) {
  const totalSec = (scenario.durationSec !== undefined && scenario.durationSec !== null) ? scenario.durationSec : 20;
  const intervalMs = scenario.intervalMs ?? 2000;
  const stepSec = intervalMs / 1000;
  const geofence = scenario.geofence || { type: 'BBOX', minLat: 19, maxLat: 19.2, minLng: 72.8, maxLng: 73 };
  let tSec = 0;

  // Manual (durationSec === 0): send one seed packet so VIAL-003 exists on backend and shows on demo.
  // Real ESP32 packets will then appear as latest telemetry and show actual temperature.
  if (totalSec === 0 && scenario.shipmentId) {
    const seed = {
      shipmentId: scenario.shipmentId,
      deviceId: 'MANUAL-SETUP', // so backend can prefer real device (ESP32) over this seed
      ts: new Date().toISOString(),
      tempC: 22,
      humidity: 50,
      pressurePa: 1013,
      lat: (scenario.route && scenario.route[0]) ? scenario.route[0].lat : 19.076,
      lng: (scenario.route && scenario.route[0]) ? scenario.route[0].lng : 72.8777,
    };
    if (scenario.tempMin != null) seed.tempMin = scenario.tempMin;
    if (scenario.tempMax != null) seed.tempMax = scenario.tempMax;
    try {
      await post(`${backendUrl}/iot/telemetry`, seed, geofence);
    } catch (err) {
      console.error('[runScenario] manual seed packet failed:', err.message);
    }
    return { done: true, shipmentId: scenario.shipmentId };
  }

  while (tSec < totalSec) {
    const temp = interpolate(scenario.tempProfile, tSec);
    const pos = interpolateRoute(scenario.route, tSec, totalSec);
    const ev = getEventForTime(scenario.events || [], tSec);
    let lat = pos.lat, lng = pos.lng;
    if (ev.routeDeviation) { lat += 0.15; lng += 0.15; }

    let pressurePa = 1010 + Math.random() * 20;
    if (scenario.pressureBreachAtSec != null && tSec >= scenario.pressureBreachAtSec) {
      pressurePa = scenario.pressureBreachValue ?? 750;
    }

    const packet = {
      shipmentId: scenario.shipmentId,
      deviceId: scenario.deviceId || 'SIM-CONTROL',
      ts: new Date().toISOString(),
      tempC: Math.round(temp.tempC * 10) / 10,
      humidity: 60 + Math.random() * 10,
      pressurePa: Math.round(pressurePa),
      lat: Math.round(lat * 10000) / 10000,
      lng: Math.round(lng * 10000) / 10000,
      speedKmph: 25 + Math.random() * 10,
      lidOpen: ev.lidOpen || false,
      shock: ev.lidOpen ? 1 : 0,
      batteryV: 3.9 - (tSec / totalSec) * 0.1,
    };
    if (scenario.tempMin != null) packet.tempMin = scenario.tempMin;
    if (scenario.tempMax != null) packet.tempMax = scenario.tempMax;

    try {
      const res = await post(`${backendUrl}/iot/telemetry`, packet, geofence);
      const violations = res?.violations || {};
      if (onProgress) onProgress({ tSec, packet, violations });
    } catch (err) {
      if (onProgress) onProgress({ tSec, error: err.message });
    }
    tSec += stepSec;
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  return { done: true, shipmentId: scenario.shipmentId };
}

module.exports = { runScenario };
