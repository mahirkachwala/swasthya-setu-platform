const mongoose = require('mongoose');

const telemetrySchema = new mongoose.Schema({
  shipmentId: { type: String, required: true, index: true },
  deviceId: { type: String, required: true },
  ts: { type: Date, required: true },
  tempC: { type: Number, required: true },
  humidity: { type: Number },
  lat: { type: Number },
  lng: { type: Number },
  speedKmph: { type: Number },
  lidOpen: { type: Boolean, default: false },
  shock: { type: Number, default: 0 },
  pressurePa: { type: Number },
  batteryV: { type: Number },
  // Derived flags (set by alert engine)
  coldChainViolation: { type: Boolean, default: false },
  tamperViolation: { type: Boolean, default: false },
  pressureViolation: { type: Boolean, default: false },
  routeViolation: { type: Boolean, default: false },
}, { collection: 'Telemetry', timestamps: true });

module.exports = mongoose.model('Telemetry', telemetrySchema);
