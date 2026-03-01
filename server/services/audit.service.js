const crypto = require('crypto');
const AuditLog = require('../models/AuditLog');

async function appendAudit(shipmentId, eventType, payload) {
  const payloadStr = typeof payload === 'string' ? payload : JSON.stringify(payload);
  const last = await AuditLog.findOne({ shipmentId }).sort({ ts: -1 });
  const prevHash = last ? last.hash : '0';
  const ts = new Date().toISOString();
  const hash = crypto.createHash('sha256').update(prevHash + payloadStr + ts).digest('hex');
  return AuditLog.create({ shipmentId, eventType, ts, payloadJson: payloadStr, prevHash, hash });
}

async function getAuditChain(shipmentId) {
  return AuditLog.find({ shipmentId }).sort({ ts: 1 }).lean();
}

function computeEventHash(event) {
  return crypto.createHash('sha256').update(JSON.stringify(event)).digest('hex');
}

module.exports = { appendAudit, getAuditChain, computeEventHash };
