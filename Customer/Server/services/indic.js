const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY || '';
const HF_BASE = 'https://api-inference.huggingface.co/models';

const STT_MODELS = {
  hi: 'ai4bharat/indicwav2vec-hindi',
  bn: 'ai4bharat/indicwav2vec_v1_bengali',
  ta: 'ai4bharat/indicwav2vec_v1_tamil',
  te: 'ai4bharat/indicwav2vec_v1_telugu',
  mr: 'ai4bharat/indicwav2vec-hindi',
  gu: 'ai4bharat/indicwav2vec_v1_gujarati',
  or: 'ai4bharat/indicwav2vec_v1_odia',
  en: 'openai/whisper-small'
};

const TRANS_MODEL = 'ai4bharat/indictrans2-en-indic-dist-200M';
const TRANS_MODEL_INDIC_EN = 'ai4bharat/indictrans2-indic-en-dist-200M';

const INDIC_LANG_CODES = {
  hi: 'hin_Deva', mr: 'mar_Deva', bn: 'ben_Beng', ta: 'tam_Taml',
  te: 'tel_Telu', gu: 'guj_Gujr', kn: 'kan_Knda', ml: 'mal_Mlym',
  pa: 'pan_Guru', en: 'eng_Latn', or: 'ory_Orya', sa: 'san_Deva',
  ur: 'urd_Arab', ne: 'nep_Deva', as: 'asm_Beng'
};

function getHeaders() {
  const h = { 'Content-Type': 'application/json' };
  if (HUGGINGFACE_API_KEY) h['Authorization'] = `Bearer ${HUGGINGFACE_API_KEY}`;
  return h;
}

async function speechToText(audioBuffer, language = 'hi') {
  const modelId = STT_MODELS[language] || STT_MODELS['hi'];
  const url = `${HF_BASE}/${modelId}`;

  if (!HUGGINGFACE_API_KEY) {
    console.log('[INDIC-STT] No HUGGINGFACE_API_KEY — using fallback');
    return { text: '', source: 'fallback', model: modelId, error: 'No API key configured. Using browser Speech Recognition as fallback.' };
  }

  try {
    const fetch = (await import('node-fetch')).default;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${HUGGINGFACE_API_KEY}` },
      body: audioBuffer,
      timeout: 30000
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.log(`[INDIC-STT] API error ${res.status}: ${errBody}`);
      if (res.status === 503) {
        return { text: '', source: 'loading', model: modelId, error: 'Model is loading. Please try again in 20-30 seconds.' };
      }
      return { text: '', source: 'error', model: modelId, error: `API error: ${res.status}` };
    }

    const data = await res.json();
    const text = data.text || (Array.isArray(data) && data[0]?.text) || '';
    return { text, source: 'indicwav2vec', model: modelId, language };
  } catch (err) {
    console.log(`[INDIC-STT] Failed: ${err.message}`);
    return { text: '', source: 'error', model: modelId, error: err.message };
  }
}

async function translate(text, sourceLang, targetLang) {
  if (!text || sourceLang === targetLang) {
    return { translatedText: text, source: 'passthrough' };
  }

  const srcCode = INDIC_LANG_CODES[sourceLang];
  const tgtCode = INDIC_LANG_CODES[targetLang];

  if (!srcCode || !tgtCode) {
    return { translatedText: text, source: 'unsupported', error: `Unsupported language: ${sourceLang} or ${targetLang}` };
  }

  if (!HUGGINGFACE_API_KEY) {
    console.log('[INDIC-TRANS] No HUGGINGFACE_API_KEY — passthrough');
    return { translatedText: text, source: 'fallback', model: TRANS_MODEL, error: 'No API key configured.' };
  }

  const modelId = sourceLang === 'en' ? TRANS_MODEL : TRANS_MODEL_INDIC_EN;

  try {
    const fetch = (await import('node-fetch')).default;
    const res = await fetch(`${HF_BASE}/${modelId}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        inputs: text,
        parameters: {
          src_lang: srcCode,
          tgt_lang: tgtCode
        }
      }),
      timeout: 30000
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.log(`[INDIC-TRANS] API error ${res.status}: ${errBody}`);
      if (res.status === 503) {
        return { translatedText: text, source: 'loading', model: modelId, error: 'Model is loading. Please try again in 20-30 seconds.' };
      }
      return { translatedText: text, source: 'error', model: modelId, error: `API error: ${res.status}` };
    }

    const data = await res.json();
    const translated = Array.isArray(data) ? (data[0]?.translation_text || data[0]?.generated_text || text) : (data.translation_text || text);
    return { translatedText: translated, source: 'indictrans2', model: modelId, from: sourceLang, to: targetLang };
  } catch (err) {
    console.log(`[INDIC-TRANS] Failed: ${err.message}`);
    return { translatedText: text, source: 'error', model: modelId, error: err.message };
  }
}

function getModelInfo() {
  return {
    stt: {
      name: 'IndicWav2Vec (AI4Bharat)',
      repo: 'https://github.com/AI4Bharat/IndicWav2Vec',
      models: STT_MODELS,
      configured: !!HUGGINGFACE_API_KEY
    },
    translation: {
      name: 'IndicTrans2 (AI4Bharat)',
      repo: 'https://github.com/AI4Bharat/IndicTrans2',
      models: { enToIndic: TRANS_MODEL, indicToEn: TRANS_MODEL_INDIC_EN },
      supportedLanguages: Object.keys(INDIC_LANG_CODES),
      configured: !!HUGGINGFACE_API_KEY
    }
  };
}

module.exports = { speechToText, translate, getModelInfo, INDIC_LANG_CODES, STT_MODELS };
