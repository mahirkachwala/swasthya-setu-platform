const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const auditService = require('../services/audit.service');
const chainService = require('../services/chain.service');
const crypto = require('crypto');

/**
 * POST /api/appointments
 * Create appointment (from rural user app). Records to audit chain + blockchain.
 */
router.post('/', express.json(), async (req, res) => {
  try {
    const { aadhaarHash, aadhaarMasked, centerId, centerName, lat, lng, slot, dose, language } = req.body;
    if ((!aadhaarHash && !aadhaarMasked) || !centerId) {
      return res.status(400).json({ error: 'Missing aadhaarHash/aadhaarMasked or centerId' });
    }

    const payload = {
      aadhaarHash: aadhaarHash || aadhaarMasked,
      aadhaarMasked: aadhaarMasked || (aadhaarHash ? 'XXXX-XXXX-' + String(aadhaarHash).slice(-4) : ''),
      centerId,
      centerName: centerName || '',
      lat: lat || null,
      lng: lng || null,
      slot: slot || '',
      dose: dose || 1,
      language: language || 'en',
      ts: new Date().toISOString(),
    };

    const eventHash = crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
    const chainResult = await chainService.recordEvent('BOOKING', eventHash, 'BOOKING_CREATED', payload.ts);
    await auditService.appendAudit('BOOKING', 'BOOKING_CREATED', payload);

    const apt = await Appointment.create({
      aadhaarHash: payload.aadhaarHash,
      aadhaarMasked: payload.aadhaarMasked,
      centerId: payload.centerId,
      centerName: payload.centerName,
      lat: payload.lat,
      lng: payload.lng,
      slot: payload.slot,
      dose: payload.dose,
      language: payload.language,
      eventHash,
      txHash: chainResult.txHash,
    });

    res.status(201).json({
      ok: true,
      appointmentId: apt._id,
      txHash: chainResult.txHash,
      message: 'Appointment created and recorded on chain.',
    });
  } catch (err) {
    console.error('[appointments]', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/appointments
 * List appointments (for doctor portal). Query: ?status=PENDING&limit=50
 */
router.get('/', async (req, res) => {
  try {
    const status = req.query.status;
    const limit = Math.min(parseInt(req.query.limit) || 50, 200);
    const filter = status ? { status } : {};
    const appointments = await Appointment.find(filter).sort({ createdAt: -1 }).limit(limit).lean();
    res.json({ appointments });
  } catch (err) {
    console.error('[appointments]', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/appointments/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const apt = await Appointment.findById(req.params.id).lean();
    if (!apt) return res.status(404).json({ error: 'Not found' });
    res.json(apt);
  } catch (err) {
    console.error('[appointments]', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
