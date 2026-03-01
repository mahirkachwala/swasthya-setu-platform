const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  shipmentId: { type: String, required: true, index: true },
  eventType: {
    type: String,
    required: true,
    enum: ['COLD_CHAIN_BREACH', 'TAMPER_LID_OPEN', 'TAMPER_SHOCK', 'PRESSURE_ANOMALY', 'ROUTE_DEVIATION', 'BOOKING_CREATED'],
  },
  severity: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'HIGH' },
  tsStart: { type: Date },
  tsEnd: { type: Date },
  evidence: { type: mongoose.Schema.Types.Mixed },
  eventHash: { type: String },
  txHash: { type: String },
  blockNumber: { type: Number },
  network: { type: String },
}, { collection: 'Event', timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
