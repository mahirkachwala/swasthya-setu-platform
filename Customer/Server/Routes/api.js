const express = require('express');
const router = express.Router();
const multer = require('multer');
const aadhaarData = require('../data/aadhaar.json');
const centersData = require('../data/centers.json');
const { sha256 } = require('../services/auditChain');
const indic = require('../services/indic');
const sarvam = require('../services/sarvam');
const { callGemini, matchCenter } = require('../services/gemini');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const appointments = [];
const inventory = {};
const shipments = [];
const shipmentCheckpoints = {};
const simTimers = new Map();

function initInventory() {
  for (const c of centersData) {
    for (const [vt, qty] of Object.entries(c.vaccinesAvailable)) {
      const key = `${c.centerId}_${vt}`;
      if (!inventory[key]) {
        inventory[key] = { centerId: c.centerId, vaccineType: vt, quantity: qty };
      }
    }
  }
}
initInventory();

const defaultShipment = {
  shipmentId: 'SHIP-00045',
  manufacturer: 'Serum Institute',
  batchNo: 'BATCH-2026-009',
  vaccineType: 'Covishield',
  quantity: 500,
  originName: 'Pune Plant',
  originLat: 18.5204,
  originLng: 73.8567,
  destinationCenterId: 'CEN-001',
  status: 'CREATED',
  currentLat: 18.5204,
  currentLng: 73.8567,
  currentCheckpoint: 'Pune Plant',
  lastUpdateTs: new Date().toISOString()
};
shipments.push(defaultShipment);
shipmentCheckpoints['SHIP-00045'] = [
  { name: 'Pune Plant', lat: 18.5204, lng: 73.8567, etaSec: 0 },
  { name: 'Hub A - Lonavala', lat: 18.7500, lng: 73.4000, etaSec: 10 },
  { name: 'Hub B - Panvel', lat: 19.0500, lng: 72.9000, etaSec: 20 },
  { name: 'PHC Andheri', lat: 19.1197, lng: 72.8464, etaSec: 30 }
];

router.get('/aadhaar/lookup/:aadhaarId', (req, res) => {
  const record = aadhaarData.find(r => r.aadhaarId === req.params.aadhaarId);
  if (!record) return res.json({ found: false });
  return res.json({
    found: true,
    name: record.name,
    dob: record.dob,
    gender: record.gender,
    phone: record.phone,
    address: record.address,
    state: record.state,
    district: record.district,
    bloodGroup: record.bloodGroup
  });
});

router.post('/aadhaar/verify', (req, res) => {
  const { aadhaarId, name, dob } = req.body;
  if (!aadhaarId || !name || !dob) {
    return res.status(400).json({ verified: false, reason: 'MISSING_FIELDS' });
  }

  const record = aadhaarData.find(r => r.aadhaarId === aadhaarId);
  if (!record) return res.json({ verified: false, reason: 'NOT_FOUND' });
  if (record.name.toLowerCase() !== name.toLowerCase()) return res.json({ verified: false, reason: 'NAME_MISMATCH' });
  if (record.dob !== dob) return res.json({ verified: false, reason: 'DOB_MISMATCH' });

  return res.json({
    verified: true,
    reason: 'MATCH',
    phone: record.phone,
    name: record.name,
    dob: record.dob,
    gender: record.gender,
    address: record.address,
    abhaId: record.abhaId,
    abhaAddress: record.abhaAddress,
    bloodGroup: record.bloodGroup,
    state: record.state,
    district: record.district
  });
});

router.get('/centers', (req, res) => {
  const result = centersData.map(c => {
    const inv = Object.entries(inventory)
      .filter(([k]) => k.startsWith(c.centerId + '_'))
      .reduce((acc, [k, v]) => { acc[v.vaccineType] = v.quantity; return acc; }, {});
    return { ...c, vaccinesAvailable: inv, openSlots: Math.max(0, c.openSlots - appointments.filter(a => a.centerId === c.centerId && a.status === 'BOOKED').length) };
  });
  res.json({ centers: result });
});

router.post('/appointments', (req, res) => {
  const { aadhaarId, patientName, phone, language, centerId, slotTime, vaccineType, aadhaarVerified } = req.body;
  if (!aadhaarId || !patientName || !centerId || !slotTime || !vaccineType) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const center = centersData.find(c => c.centerId === centerId);
  if (!center) return res.status(404).json({ error: 'Center not found' });

  const appointmentId = 'APT-' + String(Math.floor(100000 + Math.random() * 900000));
  const apt = {
    appointmentId,
    aadhaarId,
    patientName,
    phone: phone || '',
    language: language || 'en',
    centerId,
    centerName: center.name,
    slotTime,
    vaccineType,
    aadhaarVerified: aadhaarVerified || false,
    status: 'BOOKED',
    createdAt: new Date().toISOString()
  };
  appointments.push(apt);
  res.json({ appointment: apt });
});

router.get('/appointments', (req, res) => {
  let result = [...appointments];
  const { centerId, date, aadhaarId } = req.query;
  if (centerId) result = result.filter(a => a.centerId === centerId);
  if (aadhaarId) result = result.filter(a => a.aadhaarId === aadhaarId);
  if (date) {
    result = result.filter(a => {
      const d = a.slotTime.substring(0, 10);
      return d === date;
    });
  }
  result.sort((a, b) => new Date(a.slotTime) - new Date(b.slotTime));
  res.json({ appointments: result });
});

router.get('/appointments/:appointmentId', (req, res) => {
  const apt = appointments.find(a => a.appointmentId === req.params.appointmentId);
  if (!apt) return res.status(404).json({ error: 'Appointment not found' });
  res.json({ appointment: apt });
});

router.patch('/appointments/:appointmentId', (req, res) => {
  const { status } = req.body;
  const apt = appointments.find(a => a.appointmentId === req.params.appointmentId);
  if (!apt) return res.status(404).json({ error: 'Appointment not found' });

  if (status) apt.status = status;
  res.json({ appointment: apt });
});

router.get('/inventory', (req, res) => {
  const { centerId } = req.query;
  if (!centerId) return res.status(400).json({ error: 'centerId required' });
  const inv = Object.values(inventory).filter(i => i.centerId === centerId);
  res.json({ inventory: inv });
});

router.post('/inventory/reorder', (req, res) => {
  const { centerId, manufacturer, vaccineType, quantity } = req.body;
  if (!centerId || !manufacturer || !vaccineType || !quantity) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const shipmentId = 'SHIP-' + String(Math.floor(10000 + Math.random() * 90000));
  const batchNo = 'BATCH-' + new Date().getFullYear() + '-' + String(Math.floor(100 + Math.random() * 900));

  const center = centersData.find(c => c.centerId === centerId);
  const destLat = center ? center.lat : 19.12;
  const destLng = center ? center.lng : 72.85;
  const destName = center ? center.name : 'Unknown';

  const ship = {
    shipmentId,
    manufacturer,
    batchNo,
    vaccineType,
    quantity,
    originName: 'Central Warehouse',
    originLat: 19.0760,
    originLng: 72.8777,
    destinationCenterId: centerId,
    status: 'CREATED',
    currentLat: 19.0760,
    currentLng: 72.8777,
    currentCheckpoint: 'Central Warehouse',
    lastUpdateTs: new Date().toISOString()
  };
  shipments.push(ship);

  shipmentCheckpoints[shipmentId] = [
    { name: 'Central Warehouse', lat: 19.0760, lng: 72.8777, etaSec: 0 },
    { name: 'Hub A', lat: (19.0760 + destLat) / 2 - 0.02, lng: (72.8777 + destLng) / 2 + 0.01, etaSec: 10 },
    { name: 'Hub B', lat: (19.0760 + destLat) / 2 + 0.02, lng: (72.8777 + destLng) / 2 - 0.01, etaSec: 20 },
    { name: destName, lat: destLat, lng: destLng, etaSec: 30 }
  ];

  res.json({ shipmentId, status: 'CREATED' });
});

router.get('/shipments', (req, res) => {
  const { centerId } = req.query;
  let result = [...shipments];
  if (centerId) result = result.filter(s => s.destinationCenterId === centerId);
  result.sort((a, b) => new Date(b.lastUpdateTs) - new Date(a.lastUpdateTs));
  res.json({ shipments: result });
});

router.get('/shipments/:shipmentId', (req, res) => {
  const ship = shipments.find(s => s.shipmentId === req.params.shipmentId);
  if (!ship) return res.status(404).json({ error: 'Not found' });
  const cps = shipmentCheckpoints[req.params.shipmentId] || [];
  res.json({ shipment: ship, checkpoints: cps });
});

router.post('/sim/start', (req, res) => {
  const shipmentId = req.query.shipmentId || req.body.shipmentId;
  if (!shipmentId) return res.status(400).json({ error: 'shipmentId required' });

  const ship = shipments.find(s => s.shipmentId === shipmentId);
  if (!ship) return res.status(404).json({ error: 'Shipment not found' });
  if (simTimers.has(shipmentId)) return res.json({ ok: true, message: 'Already running' });

  const cps = shipmentCheckpoints[shipmentId] || [];
  let idx = 0;
  ship.status = 'IN_TRANSIT';
  ship.lastUpdateTs = new Date().toISOString();

  const t = setInterval(() => {
    idx++;
    if (idx >= cps.length) {
      clearInterval(t);
      simTimers.delete(shipmentId);
      const last = cps[cps.length - 1];
      ship.status = 'ARRIVED';
      ship.currentCheckpoint = last.name;
      ship.currentLat = last.lat;
      ship.currentLng = last.lng;
      ship.lastUpdateTs = new Date().toISOString();

      const invKey = `${ship.destinationCenterId}_${ship.vaccineType}`;
      if (inventory[invKey]) {
        inventory[invKey].quantity += ship.quantity;
      } else {
        inventory[invKey] = { centerId: ship.destinationCenterId, vaccineType: ship.vaccineType, quantity: ship.quantity };
      }
      return;
    }
    const cp = cps[idx];
    ship.currentCheckpoint = cp.name;
    ship.currentLat = cp.lat;
    ship.currentLng = cp.lng;
    ship.lastUpdateTs = new Date().toISOString();
  }, 2000);

  simTimers.set(shipmentId, t);
  res.json({ ok: true, message: 'Simulation started' });
});

router.post('/sim/stop', (req, res) => {
  const shipmentId = req.query.shipmentId || req.body.shipmentId;
  if (!shipmentId) return res.status(400).json({ error: 'shipmentId required' });
  const t = simTimers.get(shipmentId);
  if (t) { clearInterval(t); simTimers.delete(shipmentId); }
  res.json({ ok: true });
});

router.post('/qr/scan', (req, res) => {
  const { qrPayload } = req.body;
  if (!qrPayload) return res.status(400).json({ error: 'qrPayload required' });

  const parts = qrPayload.split('|');
  const shipmentId = parts[0] || 'UNKNOWN';
  const ship = shipments.find(s => s.shipmentId === shipmentId);

  res.json({
    ok: true,
    shipmentId,
    batchNo: parts[1] || null,
    status: ship ? ship.status : 'NOT_FOUND',
    message: ship ? 'Verified. Blockchain validation handled separately.' : 'Shipment not found in system.'
  });
});

router.post('/voice/stt', upload.single('audio'), async (req, res) => {
  try {
    const language = req.body?.language || 'hi';
    let audioBuffer;

    if (req.file) {
      audioBuffer = req.file.buffer;
    } else if (req.body?.audioBase64) {
      audioBuffer = Buffer.from(req.body.audioBase64, 'base64');
    } else {
      return res.status(400).json({ error: 'Provide audio file or audioBase64' });
    }

    const base64Audio = audioBuffer.toString('base64');
    const sttResult = await sarvam.transcribeAudio(base64Audio, language);

    if (sttResult.source === 'sarvam' && sttResult.transcript) {
      return res.json({
        text: sttResult.transcript,
        detectedLanguage: sttResult.detectedLanguage,
        source: 'sarvam',
        languageCode: sttResult.languageCode
      });
    }

    const mime = req.file?.mimetype || 'audio/webm';
    const needsConvert = !mime.includes('wav') && !mime.includes('flac');

    if (needsConvert) {
      const { execSync } = require('child_process');
      const fs = require('fs');
      const os = require('os');
      const path = require('path');
      const tmpIn = path.join(os.tmpdir(), `stt_in_${Date.now()}.webm`);
      const tmpOut = path.join(os.tmpdir(), `stt_out_${Date.now()}.wav`);
      try {
        fs.writeFileSync(tmpIn, audioBuffer);
        execSync(`ffmpeg -y -i ${tmpIn} -ar 16000 -ac 1 -f wav ${tmpOut} 2>/dev/null`, { timeout: 10000 });
        audioBuffer = fs.readFileSync(tmpOut);
        fs.unlinkSync(tmpIn);
        fs.unlinkSync(tmpOut);
      } catch (convErr) {
        console.log('[STT] ffmpeg conversion failed:', convErr.message);
        try { fs.unlinkSync(tmpIn); } catch (_) {}
        try { fs.unlinkSync(tmpOut); } catch (_) {}
      }
    }

    const indicResult = await indic.speechToText(audioBuffer, language);
    res.json({
      text: indicResult.text || '',
      detectedLanguage: language,
      source: indicResult.source,
      model: indicResult.model
    });
  } catch (err) {
    res.status(500).json({ error: err.message, source: 'error' });
  }
});

router.post('/voice/tts', async (req, res) => {
  const { text, language } = req.body || {};
  if (!text) return res.status(400).json({ error: 'text required' });

  const ttsResult = await sarvam.textToSpeech(text, language || 'en');
  if (ttsResult.source === 'sarvam' && ttsResult.audioBase64) {
    return res.json({
      text,
      language: language || 'en',
      audioBase64: ttsResult.audioBase64,
      source: 'sarvam'
    });
  }

  res.json({ text, language: language || 'en', source: 'browser', note: 'Use browser SpeechSynthesis for TTS playback' });
});

router.post('/translate', async (req, res) => {
  try {
    const { text, from, to } = req.body || {};
    if (!text || !from || !to) return res.status(400).json({ error: 'text, from, to required' });
    const result = await sarvam.translateText(text, from, to);
    if (result.source === 'sarvam') {
      return res.json(result);
    }
    const indicResult = await indic.translate(text, from, to);
    res.json(indicResult);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/models/info', (req, res) => {
  const indicInfo = indic.getModelInfo();
  res.json({
    ...indicInfo,
    sarvam: {
      stt: { name: 'Saarika v2 (Sarvam AI)', configured: !!process.env.SARVAM_API_KEY },
      translate: { name: 'Mayura v1 (Sarvam AI)', configured: !!process.env.SARVAM_API_KEY },
      tts: { name: 'Bulbul v1 (Sarvam AI)', configured: !!process.env.SARVAM_API_KEY }
    },
    llm: {
      name: 'Gemini 2.0 Flash (Google)',
      configured: !!process.env.GEMINI_API_KEY
    }
  });
});

router.post('/ai/chat', async (req, res) => {
  const { message, language, sessionId, userData } = req.body || {};
  if (!message) return res.status(400).json({ error: 'message required' });

  const userLang = language || 'en';
  const session = sessionId || 'default_' + Date.now();

  try {
    const geminiResult = await callGemini(message, userLang, session);
    let responseText = geminiResult.response;
    const intent = geminiResult.intent || 'NONE';
    const extracted = geminiResult.extracted || {};

    let bookingResult = null;
    if (intent === 'BOOK_APPOINTMENT' && userData && userData.aadhaarId && userData.name) {
      const centerQuery = extracted.center || '';
      const matched = matchCenter(centerQuery);
      if (matched) {
        const bookDate = extracted.date || new Date(Date.now() + 86400000).toISOString().split('T')[0];
        const slotTime = bookDate + 'T10:00:00+05:30';
        const vaccineType = extracted.vaccine || 'Covishield';
        const appointmentId = 'APT-' + String(Math.floor(100000 + Math.random() * 900000));
        const apt = {
          appointmentId,
          aadhaarId: userData.aadhaarId,
          patientName: userData.name,
          phone: userData.phone || '',
          language: userLang,
          centerId: matched.centerId,
          centerName: matched.name,
          slotTime,
          vaccineType,
          aadhaarVerified: userData.aadhaarVerified || false,
          status: 'BOOKED',
          createdAt: new Date().toISOString()
        };
        appointments.push(apt);
        bookingResult = apt;
        console.log(`[AI-CHAT] Auto-booked appointment ${appointmentId} at ${matched.name}`);
      }
    }

    let ttsAudio = null;
    try {
      const ttsResult = await sarvam.textToSpeech(responseText, userLang);
      if (ttsResult.source === 'sarvam' && ttsResult.audioBase64) {
        ttsAudio = ttsResult.audioBase64;
      }
    } catch (ttsErr) {
      console.log(`[AI-CHAT] TTS failed: ${ttsErr.message}`);
    }

    res.json({
      reply: responseText,
      language: userLang,
      source: geminiResult.source,
      intent,
      extracted,
      booking: bookingResult,
      pipeline: {
        llm: geminiResult.source,
        tts: ttsAudio ? 'sarvam' : 'browser'
      },
      audioBase64: ttsAudio
    });
  } catch (err) {
    console.log(`[AI-CHAT] Pipeline error: ${err.message}`);
    const { getFallbackResponse } = require('../services/gemini');
    res.json({
      reply: getFallbackResponse(message, userLang),
      language: userLang,
      source: 'fallback',
      intent: 'NONE',
      audioBase64: null
    });
  }
});

router.post('/voice/process', upload.single('audio'), async (req, res) => {
  try {
    const preferredLanguage = req.body?.language || 'hi';
    let audioBuffer;

    if (req.file) {
      audioBuffer = req.file.buffer;
    } else if (req.body?.audioBase64) {
      audioBuffer = Buffer.from(req.body.audioBase64, 'base64');
    } else {
      return res.status(400).json({ error: 'Provide audio file or audioBase64' });
    }

    const base64Audio = audioBuffer.toString('base64');
    let sttResult = await sarvam.transcribeAudio(base64Audio, preferredLanguage);
    let originalText = sttResult.transcript || '';
    let sttSource = sttResult.source;
    const detectedLanguage = sttResult.detectedLanguage || preferredLanguage;

    if (!originalText && sttResult.source !== 'sarvam') {
      const mime = req.file?.mimetype || 'audio/webm';
      let wavBuffer = audioBuffer;
      if (!mime.includes('wav') && !mime.includes('flac')) {
        try {
          const { execSync } = require('child_process');
          const fs = require('fs');
          const os = require('os');
          const path = require('path');
          const tmpIn = path.join(os.tmpdir(), `vp_in_${Date.now()}.webm`);
          const tmpOut = path.join(os.tmpdir(), `vp_out_${Date.now()}.wav`);
          fs.writeFileSync(tmpIn, audioBuffer);
          execSync(`ffmpeg -y -i ${tmpIn} -ar 16000 -ac 1 -f wav ${tmpOut} 2>/dev/null`, { timeout: 10000 });
          wavBuffer = fs.readFileSync(tmpOut);
          fs.unlinkSync(tmpIn); fs.unlinkSync(tmpOut);
        } catch (_) {}
      }
      const indicSTT = await indic.speechToText(wavBuffer, preferredLanguage);
      if (indicSTT.text) {
        originalText = indicSTT.text;
        sttSource = indicSTT.source;
      }
    }

    if (!originalText) {
      return res.json({
        originalText: '',
        detectedLanguage,
        englishText: '',
        responseText: 'Sorry, I could not understand the audio. Please try again.',
        responseLanguage: detectedLanguage,
        audioBase64: null,
        source: 'error'
      });
    }

    const geminiResult = await callGemini(originalText, detectedLanguage, 'voice_' + Date.now());
    let responseText = geminiResult.response;

    let audioBase64 = null;
    try {
      const ttsResult = await sarvam.textToSpeech(responseText, detectedLanguage);
      if (ttsResult.source === 'sarvam' && ttsResult.audioBase64) {
        audioBase64 = ttsResult.audioBase64;
      }
    } catch (ttsErr) {
      console.log(`[VOICE-PROCESS] TTS failed: ${ttsErr.message}`);
    }

    res.json({
      originalText,
      detectedLanguage,
      responseText,
      responseLanguage: detectedLanguage,
      audioBase64,
      source: geminiResult.source,
      intent: geminiResult.intent,
      extracted: geminiResult.extracted,
      pipeline: { stt: sttSource, llm: geminiResult.source, tts: audioBase64 ? 'sarvam' : 'browser' }
    });
  } catch (err) {
    console.log(`[VOICE-PROCESS] Pipeline error: ${err.message}`);
    res.status(500).json({ error: err.message, source: 'error' });
  }
});

router.get('/config/mappls', (req, res) => {
  const key = process.env.MAPPLS_KEY || '';
  if (!key) return res.json({ configured: false });
  res.json({ configured: true, key });
});

function getStaticReply(msg, lang) {
  const lower = msg.toLowerCase();
  const responses = {
    en: {
      center: 'I can help you find the nearest vaccination center. Open the Centers screen to see available centers near you.',
      book: 'Sure! First verify your Aadhaar, then pick a center and time slot to book your appointment.',
      vaccine: 'Vaccines available include Covishield, Covaxin, and Corbevax. All are safe and WHO-approved.',
      default: 'I can help with finding centers, booking appointments, checking status, and vaccine information. What would you like to know?'
    },
    hi: {
      center: 'मैं आपको निकटतम टीकाकरण केंद्र खोजने में मदद कर सकता हूं।',
      book: 'ज़रूर! पहले अपना आधार सत्यापित करें, फिर केंद्र और समय चुनें।',
      vaccine: 'उपलब्ध टीकों में कोविशील्ड, कोवैक्सिन और कोर्बेवैक्स शामिल हैं।',
      default: 'मैं केंद्र खोजने, अपॉइंटमेंट बुक करने और टीके की जानकारी में मदद कर सकता हूं।'
    },
    mr: {
      center: 'मी तुम्हाला जवळचे लसीकरण केंद्र शोधण्यात मदत करू शकतो.',
      book: 'नक्कीच! प्रथम आधार सत्यापित करा, नंतर केंद्र आणि वेळ निवडा.',
      vaccine: 'उपलब्ध लसींमध्ये कोविशील्ड, कोवॅक्सिन आणि कोर्बेवॅक्स यांचा समावेश आहे.',
      default: 'मी केंद्रे शोधणे, अपॉइंटमेंट बुक करणे आणि लसीची माहिती यामध्ये मदत करू शकतो.'
    }
  };

  const l = responses[lang] || responses['en'];
  if (lower.match(/center|near|kedr|kendr/i)) return l.center;
  if (lower.match(/book|appoint|slot|buk/i)) return l.book;
  if (lower.match(/vaccine|tika|lasi|safe/i)) return l.vaccine;
  return l.default;
}

module.exports = router;
