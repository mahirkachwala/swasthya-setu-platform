const crypto = require('crypto');
const AuditLog = require('../models/AuditLog');

function canonicalize(obj) {
  return JSON.stringify(obj, Object.keys(obj).sort());
}

function sha256(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

async function getLastHash(shipmentId) {
  const last = await AuditLog.findOne({ shipmentId }).sort({ ts: -1 });
  return last ? last.hash : '0'.repeat(64);
}

async function appendAuditLog(shipmentId, eventType, payload) {
  const payloadJson = canonicalize(payload);
  const prevHash = await getLastHash(shipmentId);
  const tsString = new Date().toISOString();
  const hash = sha256(prevHash + payloadJson + tsString);

  const log = new AuditLog({
    shipmentId,
    ts: tsString,
    eventType,
    payloadJson,
    prevHash,
    hash,
    tsString
  });

  await log.save();
  return { hash, prevHash, ts: tsString };
}

function hashEvent(eventObj) {
  const canonical = canonicalize(eventObj);
  return sha256(canonical);
}

async function getAuditTrail(shipmentId) {
  return AuditLog.find({ shipmentId }).sort({ ts: 1 });
}

async function verifyChain(shipmentId) {
  const logs = await getAuditTrail(shipmentId);
  if (logs.length === 0) return { valid: true, length: 0 };

  let expectedPrev = '0'.repeat(64);
  for (const log of logs) {
    if (log.prevHash !== expectedPrev) {
      return { valid: false, brokenAt: log.ts, expected: expectedPrev, got: log.prevHash };
    }
    const tsForHash = log.tsString || new Date(log.ts).toISOString();
    const computed = sha256(expectedPrev + log.payloadJson + tsForHash);
    if (computed !== log.hash) {
      return { valid: false, brokenAt: log.ts, reason: 'hash mismatch' };
    }
    expectedPrev = log.hash;
  }
  return { valid: true, length: logs.length, latestHash: expectedPrev };
}

module.exports = { appendAuditLog, hashEvent, getAuditTrail, verifyChain, sha256, canonicalize };
