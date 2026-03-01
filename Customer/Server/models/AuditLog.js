const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  shipmentId: { type: String, required: true, index: true },
  ts: { type: Date, default: Date.now },
  eventType: { type: String, required: true },
  payloadJson: { type: String, required: true },
  prevHash: { type: String, required: true },
  hash: { type: String, required: true },
  tsString: { type: String, default: null },
  txHash: { type: String, default: null },
  blockNumber: { type: Number, default: null }
}, { collection: 'AuditLog' });

module.exports = mongoose.model('AuditLog', auditLogSchema);
