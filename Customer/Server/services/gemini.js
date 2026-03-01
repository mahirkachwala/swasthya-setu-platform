let genAI;
let geminiMode = 'none';

try {
  const { GoogleGenAI } = require('@google/genai');

  if (process.env.AI_INTEGRATIONS_GEMINI_BASE_URL && process.env.AI_INTEGRATIONS_GEMINI_API_KEY) {
    genAI = new GoogleGenAI({
      apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY,
      httpOptions: {
        apiVersion: '',
        baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL,
      },
    });
    geminiMode = 'replit';
    console.log('[GEMINI] Using Replit AI Integrations');
  } else if (process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    geminiMode = 'apikey';
    console.log('[GEMINI] Using own GEMINI_API_KEY');
  } else {
    console.log('[GEMINI] No API key configured — chatbot will use fallback responses');
  }
} catch (e) {
  console.log('[GEMINI] SDK init skipped:', e.message);
}

const centersData = require('../data/centers.json');
const centersList = centersData.map(c => `${c.centerId}: ${c.name} (${c.address})`).join('\n');

const SYSTEM_PROMPT = `You are Swasthya Setu AI Assistant — a helpful, multilingual vaccination and healthcare assistant for India.

CRITICAL RULE: You MUST reply in the SAME language as the user's message. If user writes in Hindi, reply in Hindi. If Marathi, reply in Marathi. If English, reply in English. Match the user's language exactly.

You help users with:
- Booking vaccination appointments (COVID-19, Covishield, Covaxin, Corbevax)
- Finding nearby vaccination centers
- Understanding vaccine eligibility (age, conditions, doses)
- Vaccine safety information and side effects
- ABHA (Ayushman Bharat Health Account) creation and management
- Cold-chain tracking — how blockchain ensures vaccine temperature safety (2-8°C)
- Health insurance under PMJAY (Pradhan Mantri Jan Arogya Yojana)
- Post-vaccination vitals monitoring
- General health queries related to vaccination

Key facts:
- Swasthya Setu uses blockchain + IoT sensors to track vaccine cold-chain from manufacturer to patient
- Vaccines: Covishield (AstraZeneca), Covaxin (BBV152), Corbevax — all free under government program
- ABHA is a 14-digit health ID linked to Aadhaar
- Users verify identity using Aadhaar number

Available vaccination centers:
${centersList}

RESPONSE FORMAT: You MUST respond with valid JSON only. No markdown, no code blocks, no extra text. Just raw JSON:
{
  "reply": "Your helpful response text in the user's language",
  "intent": "NONE",
  "extracted": {}
}

Possible intents:
- "BOOK_APPOINTMENT" — when user wants to book a vaccination appointment. Extract: center (center name or area), date (YYYY-MM-DD format if mentioned), vaccine (vaccine type if mentioned)
- "FIND_CENTERS" — when user asks to find/see vaccination centers
- "CHECK_APPOINTMENT" — when user wants to check their appointment status
- "CHECK_ELIGIBILITY" — when user asks about vaccine eligibility
- "CREATE_ABHA" — when user wants to create ABHA health ID
- "NONE" — general information, greetings, or queries that don't need action

For BOOK_APPOINTMENT, extract available info:
{
  "reply": "response confirming or asking for missing details",
  "intent": "BOOK_APPOINTMENT",
  "extracted": {
    "center": "area/center name mentioned",
    "date": "YYYY-MM-DD if mentioned, null if not",
    "vaccine": "vaccine type if mentioned, null if not"
  }
}

Keep responses concise (2-4 sentences), helpful, and in simple language suitable for rural users.
If user asks something completely unrelated to health/vaccination, politely redirect them.`;

const conversationHistory = new Map();
const MAX_HISTORY = 10;

function getHistory(sessionId) {
  return conversationHistory.get(sessionId) || [];
}

function addToHistory(sessionId, role, text) {
  if (!conversationHistory.has(sessionId)) {
    conversationHistory.set(sessionId, []);
  }
  const history = conversationHistory.get(sessionId);
  history.push({ role, text, ts: Date.now() });
  if (history.length > MAX_HISTORY * 2) {
    history.splice(0, history.length - MAX_HISTORY * 2);
  }
}

async function callGemini(userMessage, language, sessionId) {
  if (!genAI || geminiMode === 'none') {
    return { response: getFallbackResponse(userMessage, language), source: 'fallback', intent: 'NONE', extracted: {} };
  }

  try {
    const langLabel = language === 'hi' ? 'Hindi' : language === 'mr' ? 'Marathi' : 'English';
    const langInstruction = `The user is writing in ${langLabel}. You MUST respond in ${langLabel}.`;

    const history = getHistory(sessionId || 'default');
    const historyText = history.map(h => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.text}`).join('\n');
    const contextBlock = historyText ? `\nPrevious conversation:\n${historyText}\n` : '';

    const fullPrompt = SYSTEM_PROMPT + '\n\n' + langInstruction + contextBlock + '\n\nUser: ' + userMessage;

    const result = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
      config: {
        maxOutputTokens: 8192,
        temperature: 0.7,
        responseMimeType: 'application/json'
      }
    });

    const rawText = result.text || '';
    if (!rawText) return { response: getFallbackResponse(userMessage, language), source: 'fallback', intent: 'NONE', extracted: {} };

    let parsed;
    try {
      let cleanText = rawText.trim();
      if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
      }
      parsed = JSON.parse(cleanText);
    } catch (parseErr) {
      console.log(`[GEMINI] JSON parse failed, raw: ${rawText.substring(0, 200)}`);
      parsed = { reply: rawText.trim(), intent: 'NONE', extracted: {} };
    }

    const reply = parsed.reply || parsed.response || rawText.trim();
    const intent = parsed.intent || 'NONE';
    const extracted = parsed.extracted || {};

    if (sessionId) {
      addToHistory(sessionId, 'user', userMessage);
      addToHistory(sessionId, 'assistant', reply);
    }

    return { response: reply, source: 'gemini', intent, extracted };
  } catch (err) {
    console.log(`[GEMINI] Failed: ${err.message}`);
    return { response: getFallbackResponse(userMessage, language), source: 'fallback', intent: 'NONE', extracted: {} };
  }
}

function getFallbackResponse(msg, language) {
  const lower = msg.toLowerCase();
  const responses = {
    en: {
      center: 'I can help you find the nearest vaccination center. Open the Centers screen to see available centers near you with real-time slot availability.',
      book: 'To book an appointment: verify your Aadhaar first, then pick a center and time slot. The process takes less than 2 minutes!',
      aadhaar: 'You need your Aadhaar number for verification. Your ABHA health ID will be created automatically during the process.',
      vaccine: 'Vaccines available include Covishield, Covaxin, and Corbevax. All are WHO-approved and safe. Common mild side effects include soreness and low-grade fever for 1-2 days.',
      status: 'Check your booking status in "My Appointment". You can show the QR code at the vaccination center for quick check-in.',
      coldchain: 'Swasthya Setu uses IoT sensors and blockchain to track vaccine temperature (2-8°C) from manufacturer to your arm. Every reading is recorded on an immutable ledger.',
      insurance: 'Under Ayushman Bharat PMJAY, COVID-19 vaccines are 100% covered. The scheme provides up to ₹5 lakh annual health coverage for your family.',
      eligibility: 'COVID-19 vaccines are available for ages 12+. You need 2 primary doses, and a booster is recommended 6+ months after the second dose for adults 18+.',
      default: 'I can help with finding vaccination centers, booking appointments, vaccine information, ABHA setup, cold-chain tracking, and health insurance queries. What would you like to know?'
    },
    hi: {
      center: 'मैं आपको निकटतम टीकाकरण केंद्र खोजने में मदद कर सकता हूं। उपलब्ध केंद्रों को देखने के लिए "केंद्र" स्क्रीन खोलें।',
      book: 'अपॉइंटमेंट बुक करने के लिए: पहले अपना आधार सत्यापित करें, फिर केंद्र और समय चुनें। प्रक्रिया 2 मिनट से भी कम समय लेती है!',
      aadhaar: 'सत्यापन के लिए आपको अपना आधार नंबर चाहिए। प्रक्रिया के दौरान आपकी ABHA स्वास्थ्य आईडी स्वचालित रूप से बन जाएगी।',
      vaccine: 'उपलब्ध टीके: कोविशील्ड, कोवैक्सिन और कॉर्बेवैक्स। सभी WHO-अनुमोदित और सुरक्षित हैं। सामान्य हल्के दुष्प्रभावों में 1-2 दिन दर्द और हल्का बुखार शामिल है।',
      status: '"मेरा अपॉइंटमेंट" में अपनी बुकिंग स्थिति देखें। तेज़ चेक-इन के लिए टीकाकरण केंद्र पर QR कोड दिखाएं।',
      coldchain: 'स्वास्थ्य सेतु IoT सेंसर और ब्लॉकचेन का उपयोग करके टीके का तापमान (2-8°C) निर्माता से आपकी बांह तक ट्रैक करता है।',
      insurance: 'आयुष्मान भारत PMJAY के तहत, COVID-19 टीके 100% कवर हैं। यह योजना आपके परिवार के लिए ₹5 लाख तक का वार्षिक स्वास्थ्य कवरेज प्रदान करती है।',
      eligibility: 'COVID-19 टीके 12+ उम्र के लिए उपलब्ध हैं। आपको 2 प्राथमिक खुराक चाहिए, और 18+ वयस्कों के लिए दूसरी खुराक के 6+ महीने बाद बूस्टर अनुशंसित है।',
      default: 'मैं टीकाकरण केंद्र खोजने, अपॉइंटमेंट बुक करने, टीके की जानकारी, ABHA सेटअप, और स्वास्थ्य बीमा प्रश्नों में मदद कर सकता हूं। आप क्या जानना चाहेंगे?'
    },
    mr: {
      center: 'मी तुम्हाला जवळचे लसीकरण केंद्र शोधण्यात मदत करू शकतो. उपलब्ध केंद्रे पाहण्यासाठी "केंद्रे" स्क्रीन उघडा.',
      book: 'भेट बुक करण्यासाठी: प्रथम तुमचा आधार सत्यापित करा, नंतर केंद्र आणि वेळ निवडा. प्रक्रिया 2 मिनिटांपेक्षा कमी वेळ घेते!',
      aadhaar: 'सत्यापनासाठी तुम्हाला तुमचा आधार क्रमांक आवश्यक आहे. प्रक्रियेदरम्यान तुमची ABHA आरोग्य आयडी आपोआप तयार होईल.',
      vaccine: 'उपलब्ध लसी: कोविशील्ड, कोवॅक्सिन आणि कॉर्बेवॅक्स. सर्व WHO-मान्य आणि सुरक्षित आहेत. सामान्य सौम्य दुष्परिणामांमध्ये 1-2 दिवस दुखणे आणि हलका ताप यांचा समावेश आहे.',
      status: '"माझी भेट" मध्ये तुमची बुकिंग स्थिती तपासा. जलद चेक-इनसाठी लसीकरण केंद्रावर QR कोड दाखवा.',
      coldchain: 'स्वास्थ्य सेतु IoT सेन्सर आणि ब्लॉकचेन वापरून लसीचे तापमान (2-8°C) निर्मात्यापासून तुमच्या हातापर्यंत ट्रॅक करते.',
      insurance: 'आयुष्मान भारत PMJAY अंतर्गत, COVID-19 लसी 100% कव्हर आहेत. ही योजना तुमच्या कुटुंबासाठी ₹5 लाख पर्यंत वार्षिक आरोग्य कव्हरेज प्रदान करते.',
      eligibility: 'COVID-19 लसी 12+ वयासाठी उपलब्ध आहेत. तुम्हाला 2 प्राथमिक डोस हवेत, आणि 18+ प्रौढांसाठी दुसऱ्या डोसनंतर 6+ महिन्यांनी बूस्टर शिफारस केला जातो.',
      default: 'मी लसीकरण केंद्रे शोधणे, भेटी बुक करणे, लसीची माहिती, ABHA सेटअप आणि आरोग्य विमा प्रश्नांमध्ये मदत करू शकतो. तुम्हाला काय जाणून घ्यायचे आहे?'
    }
  };

  const lang = responses[language] || responses.en;

  if (lower.match(/center|near|kedr|kendr|find|केंद्र|जवळ/)) return lang.center;
  if (lower.match(/book|appoint|slot|buk|schedule|बुक|अपॉइंटमेंट|भेट/)) return lang.book;
  if (lower.match(/document|aadhaar|aadhar|paper|abha|आधार/)) return lang.aadhaar;
  if (lower.match(/vaccine|side effect|tika|lasi|safe|covishield|covaxin|corbevax|टीक|लस|सुरक्षित/)) return lang.vaccine;
  if (lower.match(/status|check|where|track|स्थिती|स्टेटस/)) return lang.status;
  if (lower.match(/cold.?chain|blockchain|temperature|iot|sensor|तापमान|ब्लॉकचेन/)) return lang.coldchain;
  if (lower.match(/insurance|pmjay|ayushman|coverage|बीमा|विमा/)) return lang.insurance;
  if (lower.match(/eligib|age|dose|booster|पात्र|उम्र|वय|डोस/)) return lang.eligibility;
  return lang.default;
}

function matchCenter(query) {
  if (!query) return null;
  const q = query.toLowerCase();
  for (const c of centersData) {
    const name = c.name.toLowerCase();
    const addr = c.address.toLowerCase();
    if (name.includes(q) || addr.includes(q) || q.includes(name.split(' ').pop())) {
      return c;
    }
  }
  const areaMap = {
    'andheri': 'CEN-001', 'अंधेरी': 'CEN-001',
    'dadar': 'CEN-002', 'दादर': 'CEN-002',
    'thane': 'CEN-003', 'ठाणे': 'CEN-003',
    'palghar': 'CEN-004', 'पालघर': 'CEN-004',
    'borivali': 'CEN-005', 'बोरीवली': 'CEN-005',
    'vasai': 'CEN-006', 'वसई': 'CEN-006'
  };
  for (const [area, id] of Object.entries(areaMap)) {
    if (q.includes(area)) {
      return centersData.find(c => c.centerId === id) || null;
    }
  }
  return null;
}

module.exports = { callGemini, getFallbackResponse, matchCenter, centersData };
