const express = require('express');
const router = express.Router();
const VC = require('../models/VaccinationCenters');

/**
 * GET /api/centers
 * List all vaccination centers (for rural user app – map + list).
 */
router.get('/', async (req, res) => {
  try {
    const centers = await VC.find({}).lean();
    const list = centers.map((c) => ({
      id: c._id.toString(),
      name: c.name || '',
      latitude: parseFloat(c.latitude) || 0,
      longitude: parseFloat(c.longitude) || 0,
      url: c.url || '',
    }));
    res.json({ centers: list });
  } catch (err) {
    console.error('[centers]', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
