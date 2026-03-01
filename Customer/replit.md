# Swasthya Setu — Blockchain Secured Vaccine Cold Chain & Rural Appointment Platform

## Overview

Full-stack vaccine cold-chain monitoring system with:
1. **Node.js Backend** (`/Server`) — Express API, IoT telemetry, rule engine, simulation, blockchain service, Sarvam AI
2. **Citizen App** (`/citizen`) — Rural user portal: Aadhaar verification, center finder, appointment booking, AI assistant
3. **Doctor App** (`/doctor`) — Clinic dashboard: appointments, inventory, shipment tracking, QR scan
4. **IoT Dashboard** (`/dashboard`) — Real-time shipment monitoring with status, temperature charts, blockchain proofs
5. **Tracking Page** (`/track/:shipmentId`) — QR-scannable verification page showing SAFE/UNSAFE verdict
6. **Blockchain Layer** (`/blockchain`) — Solidity smart contract (VialLedger) for Ethereum event anchoring
7. **Flutter Mobile App** (root) — Android/iOS client (not runnable in Replit)

## Server Architecture

Entry point: `Server/index.js` — listens on `0.0.0.0:5000`

### Routes
| Path | File | Purpose |
|------|------|---------|
| `/` | index.js | Redirects to citizen app |
| `/citizen` | public/citizen.html | Rural user portal (verify, centers, book, appointment, chat) |
| `/doctor` | public/doctor-app.html | Doctor dashboard (appointments, inventory, shipments, QR) |
| `/dashboard` | public/dashboard.html | IoT monitoring dashboard |
| `/api/*` | Routes/api.js | Shared API (aadhaar, centers, appointments, inventory, shipments, sim, QR, voice, AI chat) |
| `/customer/*` | Routes/customer.js | Legacy customer API (register, login, book) |
| `/iot/*` | Routes/iot.js | Telemetry ingestion, shipment CRUD |
| `/simulator/*` | Routes/simulatorRoute.js | IoT simulation control (3 scenarios) |
| `/track/:id` | Routes/tracking.js | QR verification page + data API |
| `/chain/*` | Routes/chain.js | Blockchain record + status + verify |
| `/ai/*` | Routes/ai.js | Sarvam AI chat + translate |

### Services (`Server/services/`)
- `ruleEngine.js` — Evaluates telemetry: cold-chain (2-8C), tamper, geofence violations
- `auditChain.js` — SHA256 hash chain for tamper-evident audit trail
- `blockchain.js` — Ethereum integration via ethers.js (mock mode if unconfigured)
- `simulator.js` — 3 demo scenarios: normal, coldBreach, tamper+deviation
- `sarvam.js` — Sarvam AI multilingual chat/translate (fallback responses if no API key)
- `indic.js` — AI4Bharat integration: IndicWav2Vec STT + IndicTrans2 translation via HuggingFace Inference API

### Citizen App UI (`Server/public/`)
- `citizen.html` — ABHA-style single-page app with 4 tabs + 10 subpages + floating chatbot
- `css/citizen.css` — Purple/violet ABHA theme styles
- `js/citizen.js` — Tab navigation, Aadhaar lookup, ABHA creation, booking, chat overlay, voice STT, full i18n system
- Floating chat FAB on all pages (hidden on onboarding/assistant), opens overlay with voice+text input
- Chat responds in the same language the user is using (Hindi/Marathi/English)
- **i18n System**: Full multilingual UI via `I18N` object (en/hi/mr) with 140+ keys covering all dynamic content. Uses `data-i18n` (innerHTML) and `data-i18n-text` (textContent) attributes for static HTML, and `t(key)` helper for dynamic JS-rendered content. `updateLangUI()` runs on every page navigation. Translated content includes: nav bars, page headers, profile menu, onboarding, home cards, records categories, subpage titles, ABHA card labels, center cards, booking forms, appointment details, eligibility badges, vitals/insights labels, vault PIN messages, consent toggles, linked facilities, account actions, family/feedback forms, verification results, and chat error messages.
- **Subpages**: Vaccine Eligibility (form-based checker), Insurance (PMJAY coverage + claims), All Vitals (log temp/BP/HR + history), Insights (health score ring + bars + recommendations), Secret Vault (PIN-protected document storage), ABHA Settings (profile + consent toggles + linked facilities), Family Members (add/list/delete), Help & Feedback (6 FAQs + star rating + feedback form + contact), Terms of Service, Security & Privacy
- All subpage data persists in localStorage (vitals as `vc_vitals`, vault PIN as `vc_vault_pin`, vault docs as `vc_vault_docs`, family as `vc_family`, consents as `vc_abha_consents`, claims as `vc_claims`, feedbacks as `vc_feedbacks`)

### Data Files (`Server/data/`)
- `aadhaar.json` — 20 synthetic Aadhaar records for demo verification
- `centers.json` — 6 vaccination centers (Mumbai region) with coordinates, slots, vaccine stock

### Models (`Server/models/`)
- `Shipment.js`, `Telemetry.js`, `Event.js`, `AuditLog.js`, `Appointment.js`
- `User.js`, `Aadhar.js`, `OTP.js`, `Quiz.js`, `VaccinationCenters.js`, `immunogram.js`

### Frontend Pages (`Server/public/`)
- `citizen.html` + `js/citizen.js` + `css/citizen.css` — Citizen portal (mobile-first, multilingual)
- `doctor-app.html` + `js/doctor-app.js` + `css/doctor-app.css` — Doctor dashboard (desktop + responsive)
- `customer.html` + `js/customer.js` + `css/customer.css` — Legacy customer app
- `dashboard.html` + `js/dashboard.js` + `css/dashboard.css` — IoT dashboard
- `tracking.html` + `js/tracking.js` + `css/tracking.css` — Shipment verification page

## Key API Endpoints

### Shared API (`/api`)
```
POST /api/aadhaar/verify — Aadhaar verification {aadhaarId, name, dob}
GET  /api/centers — All vaccination centers with slots + stock
POST /api/appointments — Book appointment
GET  /api/appointments?centerId=&date= — Query appointments
PATCH /api/appointments/:id — Update status (CHECKED_IN, VACCINATED, CANCELLED)
GET  /api/inventory?centerId= — Vaccine stock
POST /api/inventory/reorder — Reorder vaccines (creates shipment)
GET  /api/shipments?centerId= — Shipments list
GET  /api/shipments/:id — Shipment + checkpoints
POST /api/sim/start?shipmentId= — Start shipment simulation
POST /api/sim/stop?shipmentId= — Stop simulation
POST /api/qr/scan — Verify QR payload
POST /api/ai/chat — Multilingual chatbot {message, language}
GET  /api/aadhaar/lookup/:id — Auto-fetch Aadhaar details (name, DOB, gender, phone, address)
POST /api/voice/stt — Speech-to-text via IndicWav2Vec (multipart audio or base64)
POST /api/voice/tts — Text-to-speech (browser synthesis)
POST /api/translate — Translation via IndicTrans2 {text, from, to}
GET  /api/models/info — AI model info (IndicWav2Vec + IndicTrans2 status)
```

### IoT Pipeline (`/iot`)
```
POST /iot/telemetry — Sensor data ingestion
GET  /iot/shipment/:id/latest — Current state
GET  /iot/shipment/:id/history — Telemetry history
GET  /iot/shipments — All IoT shipments
```

### Blockchain (`/chain`)
```
POST /chain/record — Write event to Ethereum
GET  /chain/status — Connection status
GET  /chain/verify/:shipmentId — On-chain events
```

## Demo Data
- **Aadhaar**: Enter `9999-1111-2222` — auto-fills: Ravi Patil, DOB 2004-01-05, ABHA ID 91-4738-2619-5043
- **ABHA ID flow**: Aadhaar number entered → details auto-fetched from simulated DB → verify → ABHA card generated
- **Default Shipment**: `SHIP-00045` (Serum Institute, Covishield, Pune -> PHC Andheri)
- **Centers**: 6 centers in Mumbai region with real coordinates
- **Languages**: English (en), Hindi (hi), Marathi (mr)

## Environment Variables (Secrets)
- `MONGODB_URI` — MongoDB connection string (optional, in-memory demo mode works without it)
- `ETHEREUM_RPC_URL` — Alchemy/Infura Sepolia RPC URL (optional)
- `WALLET_PRIVATE_KEY` — Ethereum wallet private key (optional)
- `VIAL_LEDGER_ADDRESS` — Deployed VialLedger contract address (optional)
- `SARVAM_API_KEY` — Sarvam AI: STT (Saarika v2), Translation (Mayura v1), TTS (Bulbul v2)
- `AI_INTEGRATIONS_GEMINI_BASE_URL` / `AI_INTEGRATIONS_GEMINI_API_KEY` — Replit AI Integrations for Gemini (auto-configured, no user key needed)
- `MAPPLS_KEY` — Mappls (MapmyIndia) JS SDK key for interactive vaccination center maps
- `HUGGINGFACE_API_KEY` — HuggingFace API key for IndicWav2Vec STT and IndicTrans2 translation (fallback)

## AI Voice + Chat Pipeline
Full multilingual flow: User Speech → Sarvam STT → Detect Language → Translate to English (Sarvam Mayura) → Gemini 2.0 Flash LLM → Translate back (Sarvam Mayura) → Sarvam TTS (Bulbul v2, speaker: anushka)
- **Sarvam STT**: `saarika:v2` — speech-to-text for 10 Indian languages
- **Sarvam Translate**: `mayura:v1` — bidirectional translation (en ↔ hi/mr/ta/te/bn/gu/kn/ml/pa)
- **Gemini LLM**: `gemini-2.5-flash` via Replit AI Integrations (@google/genai SDK) — contextual VaccineChain-aware responses with structured JSON output (intent detection + multilingual reply)
- **Sarvam TTS**: `bulbul:v2` — text-to-speech with Indian voice (anushka)
- Graceful fallback at every stage: Browser STT, passthrough translation, static intent responses, browser TTS

## Mappls Map Integration
- Mappls JS SDK loaded dynamically from `/api/config/mappls` (no hardcoded key)
- Centers page shows interactive vector map centered on Mumbai [72.8464, 19.1197]
- Each center has marker with popup: name, vaccines, slots, "Book Appointment" + "Navigate" buttons
- "Navigate" redirects to Google Maps directions (opens native app on mobile, web on desktop)
- Falls back to Leaflet/OSM tiles if Mappls SDK fails to load

## AI4Bharat Integration (Fallback)
- **IndicWav2Vec** (STT): `ai4bharat/indicwav2vec-hindi` + language-specific models via HuggingFace
- **IndicTrans2** (Translation): `ai4bharat/indictrans2-en-indic-dist-200M` + `indictrans2-indic-en-dist-200M`
- Used as fallback when Sarvam API is unavailable

## Running the Project
Workflow: `cd Server && node index.js` on port 5000

## Supabase Integration (Customer App)
- **Project URL**: `https://iwvqypawztxulfjhpjyz.supabase.co`
- **Table**: `appointments` — stores bookings from customer portal
- **Fields**: `appointment_id`, `name`, `phone`, `center`, `date`, `time`, `vaccine_type`, `dose`, `status`, `aadhaar_id`, `created_at`
- **Booking flow**: Customer booking inserts into both backend API and Supabase
- **Status polling**: Every 4 seconds, polls Supabase first (by `appointment_id`), falls back to backend API
- **CDN**: `@supabase/supabase-js@2` loaded via jsDelivr in `customer.html`

## Dependencies
- Node.js 20
- express, mongoose, bcryptjs, body-parser, express-session, axios, node-fetch
- Blockchain: hardhat, ethers, @nomicfoundation/hardhat-toolbox (in /blockchain)
