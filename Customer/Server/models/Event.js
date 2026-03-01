const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  shipmentId: { type: String, required: true, index: true },
  eventType: {
    type: String,
    required: true,
    enum: ['COLD_CHAIN_BREACH', 'TAMPER_LID_OPEN', 'TAMPER_SHOCK', 'ROUTE_DEVIATION', 'SHIPMENT_CREATED', 'SHIPMENT_DELIVERED']
  },
  severity: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'HIGH' },
  tsStart: { type: Date, required: true },
  tsEnd: { type: Date, default: null },
  evidence: {
    minTemp: Number,
    maxTemp: Number,
    avgTemp: Number,
    durationSec: Number,
    lidOpen: Boolean,
    shock: Number,
    routeDeviationM: Number,
    lat: Number,
    lng: Number
  },
  eventHash: { type: String, default: null },
  chainHash: { type: String, default: null },
  txHash: { type: String, default: null },
  blockNumber: { type: Number, default: null },
  network: { type: String, default: null },
  resolved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}, { collection: 'Events' });

module.exports = mongoose.model('Event', eventSchema);
