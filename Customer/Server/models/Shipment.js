const mongoose = require('mongoose');

const shipmentSchema = new mongoose.Schema({
  shipmentId: { type: String, required: true, unique: true },
  deviceId: { type: String, default: null },
  source: { type: String, required: true },
  destination: { type: String, required: true },
  batchId: { type: String, default: null },
  vaccineType: { type: String, default: 'Generic' },
  tempMin: { type: Number, default: 2 },
  tempMax: { type: Number, default: 8 },
  geofence: {
    type: { type: String, default: 'BBOX' },
    minLat: Number,
    maxLat: Number,
    minLng: Number,
    maxLng: Number
  },
  route: [{
    lat: Number,
    lng: Number
  }],
  status: { type: String, enum: ['SAFE', 'UNSAFE', 'IN_TRANSIT', 'DELIVERED'], default: 'SAFE' },
  verdict: { type: String, enum: ['SAFE', 'UNSAFE'], default: 'SAFE' },
  violations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
  latestTelemetry: { type: mongoose.Schema.Types.Mixed, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { collection: 'Shipments' });

shipmentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Shipment', shipmentSchema);
