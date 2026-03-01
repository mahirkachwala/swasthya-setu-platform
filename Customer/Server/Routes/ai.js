const express = require('express');
const router = express.Router();
const sarvam = require('../services/sarvam');

router.post('/chat', express.json(), async (req, res) => {
  try {
    const { message, language } = req.body;
    if (!message) return res.status(400).json({ error: 'message required' });

    const lang = language || 'en';
    const result = await sarvam.chat(message, lang);

    res.json({
      response: result.response,
      intent: result.intent,
      language: lang,
      source: result.source
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/translate', express.json(), async (req, res) => {
  try {
    const { text, sourceLang, targetLang } = req.body;
    if (!text || !sourceLang || !targetLang) {
      return res.status(400).json({ error: 'text, sourceLang, targetLang required' });
    }

    const result = await sarvam.translate(text, sourceLang, targetLang);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/languages', (req, res) => {
  res.json({ supported: sarvam.SUPPORTED_LANGUAGES });
});

module.exports = router;
