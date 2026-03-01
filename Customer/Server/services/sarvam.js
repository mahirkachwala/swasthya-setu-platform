const SARVAM_API_KEY = process.env.SARVAM_API_KEY;
const SARVAM_BASE_URL = 'https://api.sarvam.ai';

const SUPPORTED_LANGUAGES = ['hi', 'ta', 'te', 'bn', 'mr', 'gu', 'kn', 'ml', 'pa', 'en'];

const LANG_CODE_MAP = {
  en: 'en-IN', hi: 'hi-IN', mr: 'mr-IN', ta: 'ta-IN', te: 'te-IN',
  bn: 'bn-IN', gu: 'gu-IN', kn: 'kn-IN', ml: 'ml-IN', pa: 'pa-IN'
};

async function transcribeAudio(base64Audio, language) {
  if (!SARVAM_API_KEY) {
    console.log('[SARVAM-STT] No API key — fallback');
    return { transcript: '', detectedLanguage: language || 'en', source: 'fallback', error: 'No SARVAM_API_KEY configured' };
  }

  try {
    const fetch = (await import('node-fetch')).default;
    const langCode = LANG_CODE_MAP[language] || 'hi-IN';
    const res = await fetch(`${SARVAM_BASE_URL}/speech-to-text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': SARVAM_API_KEY
      },
      body: JSON.stringify({
        input: base64Audio,
        language_code: langCode,
        model: 'saarika:v2',
        with_timestamps: false
      }),
      timeout: 30000
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.log(`[SARVAM-STT] API error ${res.status}: ${errBody}`);
      return { transcript: '', detectedLanguage: language || 'en', source: 'error', error: `API error: ${res.status}` };
    }

    const data = await res.json();
    const detLang = (data.language_code || langCode).split('-')[0];
    return {
      transcript: data.transcript || '',
      detectedLanguage: detLang,
      source: 'sarvam',
      languageCode: data.language_code
    };
  } catch (err) {
    console.log(`[SARVAM-STT] Failed: ${err.message}`);
    return { transcript: '', detectedLanguage: language || 'en', source: 'error', error: err.message };
  }
}

async function translateText(text, fromLang, toLang) {
  if (!text || fromLang === toLang) {
    return { translatedText: text, source: 'passthrough' };
  }
  if (!SARVAM_API_KEY) {
    return { translatedText: text, source: 'fallback' };
  }

  try {
    const fetch = (await import('node-fetch')).default;
    const srcCode = LANG_CODE_MAP[fromLang] || fromLang;
    const tgtCode = LANG_CODE_MAP[toLang] || toLang;

    const res = await fetch(`${SARVAM_BASE_URL}/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': SARVAM_API_KEY
      },
      body: JSON.stringify({
        input: text,
        source_language_code: srcCode,
        target_language_code: tgtCode,
        model: 'mayura:v1',
        enable_preprocessing: true
      }),
      timeout: 15000
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.log(`[SARVAM-TRANSLATE] API error ${res.status}: ${errBody}`);
      return { translatedText: text, source: 'error', error: `API error: ${res.status}` };
    }

    const data = await res.json();
    return { translatedText: data.translated_text || text, source: 'sarvam' };
  } catch (err) {
    console.log(`[SARVAM-TRANSLATE] Failed: ${err.message}`);
    return { translatedText: text, source: 'error', error: err.message };
  }
}

async function textToSpeech(text, language) {
  if (!SARVAM_API_KEY) {
    return { audioBase64: null, source: 'fallback' };
  }

  try {
    const fetch = (await import('node-fetch')).default;
    const langCode = LANG_CODE_MAP[language] || 'en-IN';

    const res = await fetch(`${SARVAM_BASE_URL}/text-to-speech`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': SARVAM_API_KEY
      },
      body: JSON.stringify({
        inputs: [text.substring(0, 500)],
        target_language_code: langCode,
        speaker: 'anushka',
        model: 'bulbul:v2'
      }),
      timeout: 15000
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.log(`[SARVAM-TTS] API error ${res.status}: ${errBody}`);
      return { audioBase64: null, source: 'error', error: `API error: ${res.status}` };
    }

    const data = await res.json();
    const audioBase64 = data.audios?.[0] || null;
    return { audioBase64, source: 'sarvam' };
  } catch (err) {
    console.log(`[SARVAM-TTS] Failed: ${err.message}`);
    return { audioBase64: null, source: 'error', error: err.message };
  }
}

function detectIntent(text) {
  const lower = text.toLowerCase();
  if (lower.match(/hi|hello|namaste|namaskar/)) return 'greet';
  if (lower.match(/book|appointment|slot|schedule/)) return 'book';
  if (lower.match(/status|check|where|when/)) return 'status';
  return 'unknown';
}

module.exports = { transcribeAudio, translateText, textToSpeech, detectIntent, SUPPORTED_LANGUAGES, LANG_CODE_MAP };
