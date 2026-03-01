const mongoose = require('mongoose');

const shipmentSchema = new mongoose.Schema({
  shipmentId: { type: String, required: true, unique: true },
  deviceId: { type: String },
  status: { type: String, enum: ['ACTIVE', 'DELIVERED', 'ALERT'], default: 'ACTIVE' },
  origin: { type: String },
  destination: { type: String },
  createdAt: { type: Date, default: Date.now },
  lastTelemetryAt: { type: Date },
}, { collection: 'Shipment', timestamps: true });

module.exports = mongoose.model('Shipment', shipmentSchema);
