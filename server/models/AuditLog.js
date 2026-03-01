const mongoose = require('mongoose');
const crypto = require('crypto');

const auditLogSchema = new mongoose.Schema({
  shipmentId: { type: String, index: true },
  eventType: { type: String },
  ts: { type: Date, default: Date.now },
  payloadJson: { type: String },
  prevHash: { type: String },
  hash: { type: String, required: true },
  txHash: { type: String },
}, { collection: 'AuditLog', timestamps: true });

auditLogSchema.statics.append = async function (shipmentId, eventType, payload) {
  const payloadStr = typeof payload === 'string' ? payload : JSON.stringify(payload);
  const last = await this.findOne({ shipmentId }).sort({ ts: -1 });
  const prevHash = last ? last.hash : '0';
  const ts = new Date().toISOString();
  const hash = crypto.createHash('sha256').update(prevHash + payloadStr + ts).digest('hex');
  return this.create({ shipmentId, eventType, ts, payloadJson: payloadStr, prevHash, hash });
};

module.exports = mongoose.model('AuditLog', auditLogSchema);
