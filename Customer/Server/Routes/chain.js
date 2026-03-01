const express = require('express');
const router = express.Router();
const blockchainService = require('../services/blockchain');
const Event = require('../models/Event');
const { sha256 } = require('../services/auditChain');

router.post('/record', express.json(), async (req, res) => {
  try {
    const { shipmentId, eventHash, eventType, ts } = req.body;
    if (!shipmentId || !eventHash || !eventType) {
      return res.status(400).json({ error: 'shipmentId, eventHash, eventType required' });
    }

    const result = await blockchainService.recordEvent(
      shipmentId,
      eventHash,
      eventType,
      ts || new Date().toISOString()
    );

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/status', async (req, res) => {
  try {
    const status = await blockchainService.getStatus();
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/verify/:shipmentId', async (req, res) => {
  try {
    const events = await Event.find({
      shipmentId: req.params.shipmentId,
      txHash: { $ne: null }
    }).sort({ createdAt: 1 });

    res.json({
      shipmentId: req.params.shipmentId,
      onChainEvents: events.map(e => ({
        eventType: e.eventType,
        eventHash: e.eventHash,
        txHash: e.txHash,
        blockNumber: e.blockNumber,
        network: e.network,
        ts: e.tsStart
      })),
      totalOnChain: events.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
