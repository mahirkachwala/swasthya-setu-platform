const mongoose = require('mongoose');

const telemetrySchema = new mongoose.Schema({
  shipmentId: { type: String, required: true, index: true },
  deviceId: { type: String, required: true },
  ts: { type: Date, required: true },
  serverTs: { type: Date, default: Date.now },
  tempC: { type: Number, required: true },
  humidity: { type: Number, default: null },
  pressure: { type: Number, default: null },
  lat: { type: Number, default: null },
  lng: { type: Number, default: null },
  speed: { type: Number, default: null },
  lidOpen: { type: Boolean, default: false },
  shock: { type: Number, default: 0 },
  batteryV: { type: Number, default: null },
  coldChainViolation: { type: Boolean, default: false },
  tamperViolation: { type: Boolean, default: false },
  routeViolation: { type: Boolean, default: false }
}, { collection: 'Telemetry' });

module.exports = mongoose.model('Telemetry', telemetrySchema);
