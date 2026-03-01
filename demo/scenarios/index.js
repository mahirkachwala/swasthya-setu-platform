/**
 * Preset scenarios for demo. Each has: name, durationSec, intervalMs, timeline, geofenceZones, vials.
 * Timeline = when to scan QR / what happens at each second.
 * Backend URL is injected at runtime.
 */
const path = require('path');
const fs = require('fs');

// Use dir relative to server.js (injected by server) or fallback to this file's directory
let SCENARIOS_DIR = path.resolve(__dirname);
function setScenariosDir(dir) {
  if (dir) SCENARIOS_DIR = path.resolve(dir);
}

const defaultGeofence = {
  type: 'BBOX',
  minLat: 19.0,
  maxLat: 19.2,
  minLng: 72.8,
  maxLng: 73.0,
};

// Geofence zones with names (for map and "reached X" display)
const defaultZones = [
  { name: 'Warehouse A', minLat: 19.07, maxLat: 19.08, minLng: 72.87, maxLng: 72.89 },
  { name: 'Transit', minLat: 19.078, maxLat: 19.082, minLng: 72.88, maxLng: 72.89 },
  { name: 'Clinic (Destination)', minLat: 19.081, maxLat: 19.085, minLng: 72.884, maxLng: 72.89 },
];

function loadScenario(id) {
  if (!id || typeof id !== 'string') return null;
  const p = path.join(SCENARIOS_DIR, id.trim() + '.json');
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) {
    console.error('[scenarios] Failed to load', id, e.message);
    return null;
  }
}

const SCENARIO_ORDER = ['demo_geofence', 'demo_pressure', 'demo_manual'];
function listScenarios() {
  const names = fs.readdirSync(SCENARIOS_DIR).filter(f => f.endsWith('.json') && f !== 'index.json');
  const ordered = [...names].sort((a, b) => {
    const ai = SCENARIO_ORDER.indexOf(a.replace(/\.json$/, ''));
    const bi = SCENARIO_ORDER.indexOf(b.replace(/\.json$/, ''));
    if (ai >= 0 && bi >= 0) return ai - bi;
    if (ai >= 0) return -1;
    if (bi >= 0) return 1;
    return a.localeCompare(b);
  });
  return ordered.map(f => {
    const id = f.replace(/\.json$/, '');
    const s = loadScenario(id);
    return { id, name: (s && s.name) || id, durationSec: (s && s.durationSec) ?? 20, timeline: (s && s.timeline) || [] };
  });
}

module.exports = { setScenariosDir, loadScenario, listScenarios, defaultGeofence, defaultZones };
