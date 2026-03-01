# 🏥 Swasthya Setu - Blockchain-Secured Vaccine Cold Chain & Rural Healthcare Platform

<div align="center">

![Swasthya Setu](https://img.shields.io/badge/Swasthya%20Setu-Healthcare%20Platform-6C63FF?style=for-the-badge&logo=health&logoColor=white)
![Flutter](https://img.shields.io/badge/Flutter-3.7+-02569B?style=for-the-badge&logo=flutter&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Ethereum](https://img.shields.io/badge/Ethereum-Blockchain-3C3C3D?style=for-the-badge&logo=ethereum&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb&logoColor=white)

**A comprehensive healthcare ecosystem ensuring vaccine integrity through IoT monitoring, blockchain verification, and AI-powered multilingual assistance for rural India**

[Features](#-features) • [Architecture](#-system-architecture) • [Installation](#-installation) • [Demo](#-demo-data) • [API Reference](#-api-reference) • [Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Problem Statement](#-problem-statement)
- [Solution](#-our-solution)
- [Features](#-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Blockchain Integration](#-blockchain-integration)
- [AI & Voice Pipeline](#-ai--voice-pipeline)
- [Demo Data](#-demo-data)
- [Screenshots](#-screenshots)
- [Team](#-team)
- [License](#-license)

---

## 🎯 Overview

**Swasthya Setu** (Health Bridge) is an end-to-end vaccine cold chain management and rural healthcare platform that combines:

- 🌡️ **Real-time IoT Monitoring** - Temperature, GPS, and tamper detection for vaccine shipments
- 🔗 **Blockchain Verification** - Immutable audit trail using Ethereum smart contracts
- 🗣️ **Multilingual AI Assistant** - Voice-enabled chatbot supporting 10+ Indian languages
- 📱 **Mobile-First Design** - Flutter app for citizens, React dashboard for healthcare workers
- 🏥 **Rural Healthcare Focus** - ABHA/Aadhaar integration for inclusive healthcare access

---

## ❗ Problem Statement

India's vaccine distribution faces critical challenges:

1. **Cold Chain Failures** - 25% of vaccines are wasted due to temperature excursions
2. **Lack of Transparency** - No real-time visibility into vaccine shipment status
3. **Language Barriers** - Rural populations struggle with English-only healthcare apps
4. **Trust Deficit** - Citizens cannot verify if vaccines were stored properly
5. **Paper-Based Tracking** - Manual processes lead to delays and errors

---

## 💡 Our Solution

Swasthya Setu addresses these challenges through:

### 🌡️ IoT-Based Cold Chain Monitoring
- Real-time temperature monitoring (2-8°C compliant)
- GPS tracking for shipment routes
- Tamper detection (lid open, shock sensors)
- Automated alerts for violations

### 🔗 Blockchain-Anchored Verification
- Every violation event is hashed and recorded on Ethereum
- QR code scanning reveals complete shipment history
- Immutable proof of vaccine integrity
- SAFE/UNSAFE verdict for end consumers

### 🗣️ Multilingual AI Assistant
- Voice-enabled chatbot using Sarvam AI
- Supports Hindi, Marathi, Tamil, Telugu, Bengali, and more
- Natural language appointment booking
- Health queries and vaccine information

### 📱 Integrated Healthcare Ecosystem
- Citizen app for booking and verification
- Doctor dashboard for queue management
- Real-time sync between all platforms
- ABHA/Aadhaar-based identity verification

---

## ✨ Features

### For Citizens (Customer App)
| Feature | Description |
|---------|-------------|
| 🆔 **Aadhaar Verification** | KYC with automatic ABHA card generation |
| 📍 **Center Finder** | Interactive map with vaccination centers |
| 📅 **Appointment Booking** | Voice or text-based booking |
| 💬 **AI Chatbot** | Multilingual health assistant |
| 📊 **Health Records** | Vaccine history, vitals, insights |
| 🔐 **Secret Vault** | PIN-protected document storage |
| 👨‍👩‍👧 **Family Management** | Book for family members |
| 📜 **QR Verification** | Scan vial QR for authenticity |

### For Doctors (Dashboard)
| Feature | Description |
|---------|-------------|
| 📋 **Queue Management** | Real-time patient queue |
| 💉 **Inventory Control** | Stock levels, reorder alerts |
| 🚚 **Shipment Tracking** | Live shipment status |
| 📱 **QR Scanning** | Vial verification before administration |
| 📈 **Analytics** | KPIs, vaccination stats |
| 👨‍⚕️ **Multi-Doctor Support** | Switch between doctor profiles |

### For IoT Dashboard
| Feature | Description |
|---------|-------------|
| 🌡️ **Live Telemetry** | Temperature, humidity, GPS |
| ⚠️ **Alert System** | Cold chain, tamper, geofence alerts |
| 📊 **Charts** | Historical temperature graphs |
| 🔗 **Blockchain Proof** | On-chain event verification |
| 🎮 **Simulation** | 3 demo scenarios for testing |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              SWASTHYA SETU ECOSYSTEM                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                   │
│  │   Citizen   │     │   Doctor    │     │    IoT      │                   │
│  │  Flutter App│     │  Dashboard  │     │  Dashboard  │                   │
│  │  (Mobile)   │     │   (React)   │     │   (Web)     │                   │
│  └──────┬──────┘     └──────┬──────┘     └──────┬──────┘                   │
│         │                   │                   │                           │
│         └───────────────────┼───────────────────┘                           │
│                             │                                               │
│                             ▼                                               │
│              ┌──────────────────────────────┐                               │
│              │     Node.js Backend API      │                               │
│              │      (Express.js:5000)       │                               │
│              ├──────────────────────────────┤                               │
│              │  Routes:                     │                               │
│              │  • /api/* - Shared API       │                               │
│              │  • /iot/* - Telemetry        │                               │
│              │  • /chain/* - Blockchain     │                               │
│              │  • /ai/* - AI/Chat           │                               │
│              └──────────────┬───────────────┘                               │
│                             │                                               │
│         ┌───────────────────┼───────────────────┐                           │
│         │                   │                   │                           │
│         ▼                   ▼                   ▼                           │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                   │
│  │  MongoDB    │     │  Ethereum   │     │  Sarvam AI  │                   │
│  │  Database   │     │  Blockchain │     │  + Gemini   │                   │
│  └─────────────┘     └─────────────┘     └─────────────┘                   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────────┤
│  │                        SERVICES                                         │
│  ├─────────────────────────────────────────────────────────────────────────┤
│  │  • Rule Engine - Cold chain, tamper, geofence violation detection       │
│  │  • Audit Chain - SHA256 hash chain for tamper-evident logs              │
│  │  • Blockchain Service - Ethereum event anchoring via VialLedger         │
│  │  • Simulator - 3 IoT demo scenarios                                     │
│  │  • Sarvam Service - STT/TTS/Translation for 10+ languages               │
│  └─────────────────────────────────────────────────────────────────────────┘
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
IoT Sensors → Telemetry API → Rule Engine → Violation Detection
                                    ↓
                            Event Creation
                                    ↓
                    ┌───────────────┼───────────────┐
                    ↓               ↓               ↓
              MongoDB          Audit Chain     Blockchain
              (Store)          (Hash Chain)    (Immutable)
                                    ↓
                            QR Verification
                                    ↓
                            SAFE/UNSAFE Verdict
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **Flutter** | Cross-platform mobile app (Customer) |
| **React + Vite** | Doctor Dashboard & Admin Panel |
| **TailwindCSS** | Styling framework |
| **shadcn/ui** | UI component library |
| **Mappls SDK** | Interactive maps for India |

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js 20** | Runtime environment |
| **Express.js** | REST API framework |
| **MongoDB** | Primary database |
| **Mongoose** | ODM for MongoDB |

### Blockchain
| Technology | Purpose |
|------------|---------|
| **Ethereum** | Smart contract platform |
| **Solidity** | Smart contract language |
| **Hardhat** | Development framework |
| **ethers.js** | Ethereum library |

### AI & Voice
| Technology | Purpose |
|------------|---------|
| **Sarvam AI** | STT (Saarika v2), TTS (Bulbul v2), Translation (Mayura v1) |
| **Google Gemini** | LLM for contextual responses |
| **AI4Bharat** | IndicWav2Vec, IndicTrans2 (fallback) |

### DevOps
| Technology | Purpose |
|------------|---------|
| **Replit** | Cloud development & deployment |
| **Supabase** | Realtime database sync |
| **Firebase** | Push notifications |

---

## 📁 Project Structure

```
Swasthya Setu/
├── Customer/                    # Main application (Flutter + Backend)
│   ├── lib/                     # Flutter mobile app source
│   │   ├── main.dart            # App entry point
│   │   ├── homePage.dart        # Home screen
│   │   ├── login_new.dart       # Authentication
│   │   ├── Qrpage.dart          # QR scanner
│   │   ├── quiz.dart            # Health quizzes
│   │   ├── screens/             # Screen components
│   │   ├── models/              # Data models
│   │   └── services/            # API services
│   │
│   ├── Server/                  # Node.js Backend
│   │   ├── index.js             # Express server entry
│   │   ├── Routes/              # API route handlers
│   │   │   ├── api.js           # Shared API routes
│   │   │   ├── iot.js           # IoT telemetry routes
│   │   │   ├── chain.js         # Blockchain routes
│   │   │   └── ai.js            # AI/Chat routes
│   │   ├── services/            # Business logic
│   │   │   ├── ruleEngine.js    # Violation detection
│   │   │   ├── auditChain.js    # Hash chain audit
│   │   │   ├── blockchain.js    # Ethereum integration
│   │   │   ├── sarvam.js        # Sarvam AI service
│   │   │   └── simulator.js     # IoT simulation
│   │   ├── models/              # Mongoose schemas
│   │   ├── data/                # Seed data (Aadhaar, centers)
│   │   └── public/              # Frontend static files
│   │       ├── citizen.html     # Citizen portal
│   │       ├── doctor-app.html  # Doctor dashboard
│   │       ├── dashboard.html   # IoT dashboard
│   │       └── tracking.html    # Shipment verification
│   │
│   ├── blockchain/              # Smart contracts
│   │   ├── contracts/
│   │   │   └── VialLedger.sol   # Main smart contract
│   │   ├── scripts/             # Deployment scripts
│   │   └── hardhat.config.js    # Hardhat configuration
│   │
│   ├── android/                 # Android platform files
│   ├── ios/                     # iOS platform files
│   └── assets/                  # Images, icons, ABI
│
├── Doctor-Dashboard/            # React Doctor Dashboard
│   ├── client/                  # Frontend (React + Vite)
│   │   └── src/
│   │       ├── pages/           # Page components
│   │       ├── components/      # UI components
│   │       └── contexts/        # React contexts
│   ├── server/                  # Backend API
│   │   ├── routes.ts            # API routes
│   │   └── storage.ts           # Data storage
│   └── shared/                  # Shared types/schemas
│
└── Health-Bridge-Backend/       # Central Backend Service
    ├── server/                  # Express API
    ├── client/                  # Admin dashboard
    └── shared/                  # Shared schemas
```

---

## 🚀 Installation

### Prerequisites

- Node.js 20+
- Flutter 3.7+ (for mobile app)
- MongoDB (local or Atlas)
- MetaMask wallet (for blockchain features)

### Backend Setup

```bash
# Clone the repository
git clone https://github.com/AfterMath-2026/AfterMath_Bhartiya-Java-Party_Humanity.git
cd AfterMath_Bhartiya-Java-Party_Humanity

# Navigate to Customer Server
cd Customer/Server

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your credentials

# Start the server
node index.js
```

### Flutter App Setup

```bash
# Navigate to Customer directory
cd Customer

# Get Flutter dependencies
flutter pub get

# Run on Android/iOS
flutter run
```

### Doctor Dashboard Setup

```bash
# Navigate to Doctor Dashboard
cd Doctor-Dashboard

# Install dependencies
npm install

# Start development server
npm run dev
```

### Blockchain Setup (Optional)

```bash
# Navigate to blockchain directory
cd Customer/blockchain

# Install Hardhat dependencies
npm install

# Compile smart contracts
npx hardhat compile

# Deploy to Sepolia testnet
npx hardhat run scripts/deploy.js --network sepolia
```

---

## 🔐 Environment Variables

Create a `.env` file in `Customer/Server/` with:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/swasthya-setu

# Blockchain (Ethereum Sepolia)
ETHEREUM_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
WALLET_PRIVATE_KEY=your_wallet_private_key
VIAL_LEDGER_ADDRESS=0x_deployed_contract_address

# Sarvam AI (STT/TTS/Translation)
SARVAM_API_KEY=your_sarvam_api_key

# Maps
MAPPLS_KEY=your_mappls_api_key

# AI (Auto-configured on Replit)
AI_INTEGRATIONS_GEMINI_API_KEY=your_gemini_key

# Fallback AI
HUGGINGFACE_API_KEY=your_huggingface_key
```

---

## 📡 API Reference

### Shared API (`/api`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/aadhaar/verify` | POST | Verify Aadhaar and generate ABHA |
| `/api/aadhaar/lookup/:id` | GET | Auto-fetch Aadhaar details |
| `/api/centers` | GET | List vaccination centers |
| `/api/appointments` | POST | Book appointment |
| `/api/appointments` | GET | Query appointments |
| `/api/appointments/:id` | PATCH | Update status |
| `/api/inventory` | GET | Get vaccine stock |
| `/api/inventory/reorder` | POST | Reorder vaccines |
| `/api/shipments` | GET | List shipments |
| `/api/qr/scan` | POST | Verify QR payload |
| `/api/ai/chat` | POST | Multilingual chatbot |
| `/api/voice/stt` | POST | Speech to text |
| `/api/voice/tts` | POST | Text to speech |

### IoT Pipeline (`/iot`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/iot/telemetry` | POST | Ingest sensor data |
| `/iot/shipment/:id/latest` | GET | Current shipment state |
| `/iot/shipment/:id/history` | GET | Telemetry history |
| `/iot/shipments` | GET | All IoT shipments |

### Blockchain (`/chain`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/chain/record` | POST | Write event to Ethereum |
| `/chain/status` | GET | Connection status |
| `/chain/verify/:shipmentId` | GET | Get on-chain events |

### Simulation (`/simulator`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/sim/start` | POST | Start simulation scenario |
| `/api/sim/stop` | POST | Stop simulation |

---

## ⛓️ Blockchain Integration

### VialLedger Smart Contract

The `VialLedger.sol` contract provides immutable storage for violation events:

```solidity
contract VialLedger {
    struct ViolationRecord {
        bytes32 eventHash;      // SHA256 hash of event data
        string eventType;       // COLD_CHAIN_BREACH, TAMPER_LID_OPEN, etc.
        uint256 timestamp;      // Event timestamp
        uint256 blockTs;        // Block timestamp
    }

    // Record a violation event
    function recordViolation(
        string calldata shipmentId,
        bytes32 eventHash,
        string calldata eventType,
        uint256 timestamp
    ) external;

    // Get violation count for a shipment
    function getViolationCount(string calldata shipmentId) 
        external view returns (uint256);

    // Get specific violation details
    function getViolation(string calldata shipmentId, uint256 index) 
        external view returns (bytes32, string memory, uint256, uint256);
}
```

### Event Types

| Event | Severity | Trigger |
|-------|----------|---------|
| `COLD_CHAIN_BREACH` | HIGH | Temperature outside 2-8°C |
| `TAMPER_LID_OPEN` | CRITICAL | Container lid opened |
| `TAMPER_SHOCK` | CRITICAL | Physical shock detected |
| `ROUTE_DEVIATION` | MEDIUM | GPS outside geofence |

### Verification Flow

```
1. Citizen scans QR code on vaccine vial
2. App sends shipmentId to /chain/verify/:shipmentId
3. Backend queries Ethereum for all events
4. Returns SAFE (no violations) or UNSAFE (violations found)
5. Detailed event history shown to user
```

---

## 🗣️ AI & Voice Pipeline

### Complete Multilingual Flow

```
User Speech (Hindi/Marathi/etc.)
        ↓
Sarvam STT (saarika:v2)
        ↓
Detect Language
        ↓
Translate to English (mayura:v1)
        ↓
Gemini 2.5 Flash (contextual response)
        ↓
Translate to User Language (mayura:v1)
        ↓
Sarvam TTS (bulbul:v2, voice: anushka)
        ↓
Audio Response
```

### Supported Languages

| Code | Language |
|------|----------|
| en | English |
| hi | Hindi |
| mr | Marathi |
| ta | Tamil |
| te | Telugu |
| bn | Bengali |
| gu | Gujarati |
| kn | Kannada |
| ml | Malayalam |
| pa | Punjabi |

### Chatbot Intents

| Intent | Action |
|--------|--------|
| `BOOK_APPOINTMENT` | Book vaccination slot |
| `CHECK_STATUS` | Check appointment status |
| `FIND_CENTER` | Find nearby centers |
| `VACCINE_INFO` | Information about vaccines |
| `CANCEL_APPOINTMENT` | Cancel existing booking |
| `HELP` | General assistance |

---

## 🎮 Demo Data

### Test Credentials

| Type | Value | Details |
|------|-------|---------|
| **Aadhaar** | `9999-1111-2222` | Ravi Patil, DOB: 2004-01-05 |
| **Customer Login** | Aadhaar: `123456789012` | Password: `pass123` |
| **Default Shipment** | `SHIP-00045` | Serum Institute, Covishield |

### Demo Scenarios

| Scenario | Description |
|----------|-------------|
| **Normal** | Shipment with no violations |
| **Cold Breach** | Temperature exceeds 8°C |
| **Tamper + Deviation** | Lid opened + route deviation |

### Vaccination Centers

- PHC Andheri (CEN-001)
- PHC Bandra (CEN-002)
- PHC Goregaon (CEN-003)
- PHC Mulund (CEN-004)
- PHC Powai (CEN-005)
- PHC Vikhroli (CEN-006)

---

## 📸 Screenshots

<div align="center">

| Citizen App | Doctor Dashboard | IoT Dashboard |
|-------------|------------------|---------------|
| ![Citizen](assets/screenshots/citizen.png) | ![Doctor](assets/screenshots/doctor.png) | ![IoT](assets/screenshots/iot.png) |

| QR Verification | AI Chatbot | Blockchain Proof |
|-----------------|------------|------------------|
| ![QR](assets/screenshots/qr.png) | ![Chat](assets/screenshots/chat.png) | ![Chain](assets/screenshots/chain.png) |

</div>

---

## 👥 Team

**Team: Bhartiya Java Party** - AfterMath 2026

| Member | Role |
|--------|------|
| Mahir Kachwala | Full Stack Developer |
| Team Members | Contributors |

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Sarvam AI** - For multilingual STT/TTS/Translation APIs
- **AI4Bharat** - For IndicWav2Vec and IndicTrans2 models
- **Replit** - For cloud development environment
- **Mappls** - For India-centric mapping solution

---

<div align="center">

**Made with ❤️ for Rural India**

[⬆ Back to Top](#-swasthya-setu---blockchain-secured-vaccine-cold-chain--rural-healthcare-platform)

</div>
