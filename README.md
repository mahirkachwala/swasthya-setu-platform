<div align="center">

# 🏥 Swasthya Setu

### Blockchain-Secured Vaccine Cold Chain & Rural Healthcare Platform

*A comprehensive healthcare ecosystem ensuring vaccine integrity through IoT monitoring, blockchain verification, and AI-powered multilingual assistance for rural India*

---

![Flutter](https://img.shields.io/badge/Flutter-3.7+-02569B?style=for-the-badge&logo=flutter&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Ethereum](https://img.shields.io/badge/Ethereum-Blockchain-3C3C3D?style=for-the-badge&logo=ethereum&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb&logoColor=white)

[Features](#-features) • [Screenshots](#-app-screenshots) • [Architecture](#-system-architecture) • [Installation](#-installation) • [API Reference](#-api-reference) • [Team](#-team)

</div>

---

## 🎯 Overview

**Swasthya Setu** (Health Bridge) is an end-to-end vaccine cold chain management and rural healthcare platform that combines:

- 🌡️ **Real-time IoT Monitoring** — Temperature, GPS, and tamper detection for vaccine shipments using ESP32 sensors
- 🔗 **Blockchain Verification** — Immutable audit trail using Ethereum smart contracts for complete transparency
- 🗣️ **Multilingual AI Assistant** — Voice-enabled chatbot supporting 10+ Indian languages via Sarvam AI
- 📱 **Mobile-First Design** — Flutter app for citizens, React dashboard for healthcare workers
- 🏥 **Rural Healthcare Focus** — ABHA/Aadhaar integration for inclusive healthcare access across India

---

## ❗ Problem Statement

India's vaccine distribution faces critical challenges:

| Challenge | Impact |
|-----------|--------|
| **Cold Chain Failures** | 25% of vaccines wasted due to temperature excursions |
| **Lack of Transparency** | No real-time visibility into shipment status |
| **Language Barriers** | Rural populations struggle with English-only apps |
| **Trust Deficit** | Citizens cannot verify vaccine storage conditions |
| **Paper-Based Tracking** | Manual processes lead to delays and errors |

---

## 💡 Our Solution

| Solution | Description |
|----------|-------------|
| 🌡️ **IoT Cold Chain** | Real-time temperature monitoring (2-8°C), GPS tracking, tamper detection, automated alerts |
| 🔗 **Blockchain Verification** | Every violation hashed on Ethereum, QR code reveals history, SAFE/UNSAFE verdict |
| 🗣️ **Multilingual AI** | Voice chatbot via Sarvam AI, supports 10+ Indian languages, natural language booking |
| 📱 **Integrated Ecosystem** | Citizen app + Doctor dashboard + Real-time sync + ABHA/Aadhaar verification |

---

## ✨ Features

### 📱 For Citizens (Mobile App)

| Feature | Description |
|---------|-------------|
| 🆔 **Aadhaar Verification** | KYC with automatic ABHA card generation for unified health identity |
| 📍 **Center Finder** | Interactive map with vaccination centers using Mappls SDK |
| 📅 **Appointment Booking** | Voice or text-based booking in regional languages |
| 💬 **AI Chatbot** | Multilingual health assistant for queries and guidance |
| 📊 **Health Records** | View vaccine history, vitals, and health insights |
| 🔐 **Secret Vault** | PIN-protected storage for sensitive health documents |
| 👨‍👩‍👧 **Family Management** | Book and manage appointments for family members |
| 📜 **QR Verification** | Scan vial QR to verify vaccine authenticity via blockchain |

### 🏥 For Doctors (Dashboard)

| Feature | Description |
|---------|-------------|
| 📋 **Queue Management** | Real-time patient queue (BOOKED → CHECKED_IN → VACCINATED → DISPOSED) |
| 💉 **Inventory Control** | Stock levels, batch tracking, low-stock alerts, one-click reorder |
| 🚚 **Shipment Tracking** | Live status with multi-checkpoint timeline and alerts |
| 📱 **QR Scanning** | Vial verification before administration |
| 📈 **Analytics** | KPI cards, capacity gauge, real-time alerts dashboard |
| 👥 **Patient Registry** | Aggregated view with Aadhaar/ABHA verification status |

### 🌡️ For IoT Dashboard

| Feature | Description |
|---------|-------------|
| 🌡️ **Live Telemetry** | Real-time temperature, humidity, GPS monitoring |
| ⚠️ **Alert System** | Automated cold chain, tamper, and geofence breach alerts |
| 🔗 **Blockchain Proof** | On-chain event verification for immutable audit trail |

---

## 📸 App Screenshots

### 🏠 Home & Appointment Booking

The home screen provides quick access to all features, while the booking flow allows citizens to select a center, date, and time slot with a confirmation QR code.

<div align="center">
<table>
<tr>
<td align="center"><img src="home.jpg" width="220"/><br/><b>Home Screen</b><br/><i>Health dashboard with quick actions</i></td>
<td align="center"><img src="manual-appointment.jpg" width="220"/><br/><b>Book Appointment</b><br/><i>Select center, date & time slot</i></td>
<td align="center"><img src="apppointent-booked.jpg" width="220"/><br/><b>Booking Confirmed</b><br/><i>Appointment details & QR code</i></td>
</tr>
</table>
</div>

### 💬 AI Chatbot — Multilingual Voice Assistant

The AI chatbot understands natural language in 10+ Indian languages. Users can type or speak their health queries and receive accurate responses in their preferred language.

<div align="center">
<table>
<tr>
<td align="center"><img src="chat1.jpg" width="220"/><br/><b>Chat Interface</b><br/><i>Natural language health queries</i></td>
<td align="center"><img src="chat2.jpg" width="220"/><br/><b>Voice Input</b><br/><i>Speak in your preferred language</i></td>
<td align="center"><img src="chat3.jpg" width="220"/><br/><b>AI Response</b><br/><i>Get answers in 10+ Indian languages</i></td>
</tr>
</table>
</div>

### 🆔 ABHA & Family Management

Citizens can generate their ABHA digital health ID via Aadhaar verification and manage vaccination bookings for their entire family from a single account.

<div align="center">
<table>
<tr>
<td align="center"><img src="abha.jpg" width="220"/><br/><b>ABHA Card</b><br/><i>Digital health ID with QR code</i></td>
<td align="center"><img src="family.jpg" width="220"/><br/><b>Family Members</b><br/><i>Manage & book for family</i></td>
<td align="center"><img src="help.jpg" width="220"/><br/><b>Help & Support</b><br/><i>In-app guidance & FAQs</i></td>
</tr>
</table>
</div>

### 🔐 Secret Vault

A PIN-protected vault for storing sensitive health documents like prescriptions, lab reports, and insurance papers — accessible only to the authenticated user.

<div align="center">
<table>
<tr>
<td align="center"><img src="vault.jpg" width="220"/><br/><b>Vault Entry</b><br/><i>PIN-protected secure storage</i></td>
<td align="center"><img src="vault-inside.jpg" width="220"/><br/><b>Vault Contents</b><br/><i>Store sensitive health documents</i></td>
</tr>
</table>
</div>

### 🔗 Blockchain Verification (QR Scan)

Citizens can scan a vial's QR code to instantly verify vaccine authenticity. The result shows a blockchain-verified SAFE or UNSAFE verdict along with the full cold chain violation history.

<div align="center">
<table>
<tr>
<td align="center"><img src="images/safe-qr.jpeg" width="220"/><br/><b>Safe Vaccine ✅</b><br/><i>Vaccine storage verified safe</i></td>
<td align="center"><img src="images/breach-qr.jpeg" width="220"/><br/><b>Breach Detected ⚠️</b><br/><i>Cold chain breach detected</i></td>
<td align="center"><img src="images/breach-result.jpeg" width="220"/><br/><b>Breach Details</b><br/><i>Complete violation history</i></td>
</tr>
</table>
</div>

### 🌡️ IoT Dashboard & Monitoring

The IoT dashboard displays live sensor telemetry including temperature trends, humidity data, and GPS location. Anomaly detection algorithms automatically flag cold chain breaches.

<div align="center">
<table>
<tr>
<td align="center"><img src="images/metrics.jpeg" width="220"/><br/><b>Live Telemetry</b><br/><i>Real-time sensor readings</i></td>
<td align="center"><img src="images/temp-details.jpeg" width="220"/><br/><b>Temperature Details</b><br/><i>Temperature trend analysis</i></td>
<td align="center"><img src="images/anomaly.jpeg" width="220"/><br/><b>Anomaly Detection</b><br/><i>Automatic anomaly alerts</i></td>
</tr>
</table>
</div>

### ⛓️ Blockchain Transactions

Every cold chain violation is recorded as an immutable transaction on the Ethereum Sepolia testnet. The event logs provide a tamper-proof audit trail for complete transparency.

<div align="center">
<table>
<tr>
<td align="center"><img src="images/ether.jpeg" width="220"/><br/><b>Ethereum Network</b><br/><i>Sepolia testnet deployment</i></td>
<td align="center"><img src="images/transaction.jpeg" width="220"/><br/><b>Transaction Hash</b><br/><i>On-chain violation records</i></td>
<td align="center"><img src="images/logs.jpeg" width="220"/><br/><b>Event Logs</b><br/><i>Immutable event history</i></td>
</tr>
</table>
</div>

### 🔧 Hardware Setup (ESP32 IoT)

The IoT monitoring unit uses an ESP32 microcontroller with a DHT22 temperature sensor and a GPS Neo-6M module. The hardware is mounted inside vaccine cold boxes for real-time tracking.

<div align="center">
<table>
<tr>
<td align="center"><img src="images/hardware.jpeg" width="280"/><br/><b>Sensor Module</b><br/><i>Temperature & GPS sensor module</i></td>
<td align="center"><img src="images/hardware2.jpeg" width="280"/><br/><b>Complete IoT Unit</b><br/><i>ESP32 monitoring unit with display</i></td>
</tr>
</table>
</div>

### 📱 QR Code — Vial Tracking

Each vaccine vial has a unique QR code that links to its full cold chain history on the blockchain. Healthcare workers scan the code before administration to verify authenticity.

<div align="center">
<table>
<tr>
<td align="center"><img src="images/qr.jpeg" width="280"/><br/><b>Vial QR Code</b><br/><i>Scannable code for blockchain verification</i></td>
<td align="center"><img src="images/transaction2.jpeg" width="280"/><br/><b>Transaction Details</b><br/><i>On-chain verification records</i></td>
</tr>
</table>
</div>

---

## 🏗️ System Architecture

The platform follows a modular multi-layer architecture designed for scalable and transparent healthcare infrastructure.

| Layer | Components | Role |
|-------|------------|------|
| **Citizen Layer** | Flutter Mobile App | Citizens register, book appointments, access health records, and interact with AI chatbot |
| **Doctor Layer** | React Dashboard | Healthcare workers manage queues, inventory, shipments, and vaccination records |
| **Backend Layer** | Node.js, Express, MongoDB | Handles API requests, authentication, and system data management |
| **Blockchain Layer** | Ethereum Smart Contracts | Stores immutable records of cold-chain violations and shipment traceability |
| **IoT Layer** | ESP32 Sensors, Telemetry Server | Collects temperature, GPS, and tamper data from vaccine shipments |
| **AI Layer** | Sarvam AI, Google Gemini | Provides multilingual chatbot and voice assistance |

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend (Mobile)** | Flutter, Dart |
| **Frontend (Web)** | React 18, TypeScript, Vite, TailwindCSS, shadcn/ui |
| **Backend** | Node.js 20, Express, MongoDB, Mongoose, JWT |
| **Blockchain** | Ethereum, Solidity, Hardhat, ethers.js |
| **AI & Voice** | Sarvam AI (STT/TTS), Google Gemini, AI4Bharat |
| **Maps** | Mappls SDK (India-centric) |
| **IoT** | ESP32, DHT22 Temperature Sensor, GPS Neo-6M Module |

---

## 📁 Project Structure

```
swasthya-setu-platform/
│
├── Customer/                    # 📱 Flutter Mobile App (Citizen-facing)
│   ├── lib/                     # Dart source code
│   │   ├── main.dart            # App entry point
│   │   ├── screens/             # UI screens (home, chat, booking, etc.)
│   │   ├── services/            # API and blockchain services
│   │   └── widgets/             # Reusable UI components
│   ├── android/                 # Android configuration
│   ├── ios/                     # iOS configuration
│   ├── assets/                  # Images, icons, fonts
│   └── blockchain/              # Smart contract integration (Hardhat)
│
├── Doctor-Dashboard/            # 🏥 React Web Dashboard (Healthcare workers)
│   ├── client/                  # React frontend with shadcn/ui
│   │   ├── src/pages/           # Dashboard pages (queue, inventory, etc.)
│   │   └── src/components/      # Reusable React components
│   ├── server/                  # Express backend API
│   └── shared/                  # Shared TypeScript types and schemas
│
├── Health-Bridge-Backend/       # 🔧 Central Backend API
│   ├── server/                  # Express API with routes
│   └── shared/                  # Shared validation schemas (Zod)
│
├── server/                      # 🌡️ IoT & Blockchain Backend
│   ├── index.js                 # Server entry point
│   ├── Routes/                  # API route handlers
│   │   ├── telemetry.js         # IoT sensor data ingestion
│   │   └── blockchain.js        # Ethereum transaction handlers
│   ├── models/                  # MongoDB schemas
│   └── services/                # Business logic (alerts, verification)
│
├── demo/                        # 🎮 Demo scenarios for testing
│   ├── server.js                # Demo server
│   └── scenarios/               # Test scenarios (normal, breach, tamper)
│
└── images/                      # 📸 Screenshots & documentation images
```

---



## 🚀 Installation

### Prerequisites

- **Node.js** 20+ 
- **Flutter** 3.7+ (for mobile app)
- **MongoDB** (local or [Atlas](https://www.mongodb.com/atlas))
- **MetaMask** wallet (for blockchain features)

### 1. Clone the Repository

```bash
git clone https://github.com/mahirkachwala/swasthya-setu-platform.git
cd swasthya-setu-platform
```

### 2. Doctor Dashboard (React)

```bash
cd Doctor-Dashboard
npm install
npm run dev
# Open http://localhost:5001
```

### 3. Backend Server (Node.js)

```bash
cd server
npm install
npm start
# Runs on http://localhost:8000
```

### 4. Flutter Mobile App

```bash
cd Customer
flutter pub get
flutter run
```

### 5. Blockchain Module

```bash
cd Customer/blockchain
npm install
npx hardhat compile

# Deploy to Sepolia testnet
npx hardhat run scripts/deploy.js --network sepolia
```

---

## 🔐 Environment Variables

Each module requires specific environment variables. Copy `.env.example` to `.env` and configure:

| Module | Key Variables |
|--------|---------------|
| **IoT Server** | `PORT`, `MONGO_URI`, `USE_MOCK_CHAIN` |
| **Doctor Dashboard** | `PORT`, `MONGO_URI`, `ALLOWED_ORIGINS` |
| **Backend Server** | `MONGODB_URI`, `JWT_SECRET`, `ADMIN_API_KEY` |
| **Blockchain** | `ETHEREUM_RPC_URL`, `WALLET_PRIVATE_KEY`, `VIAL_LEDGER_ADDRESS` |
| **AI Services** | `SARVAM_API_KEY`, `GEMINI_API_KEY` |

---

## 📡 API Reference

### Core APIs (Doctor Dashboard)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/appointments` | GET/POST/PATCH | Manage vaccination appointments |
| `/api/inventory` | GET | List vaccine inventory items |
| `/api/inventory/reorder` | POST | Create reorder request for low stock |
| `/api/shipments` | GET | Track shipments with live status |
| `/api/centers` | GET | List all vaccination centers |
| `/api/qr/scan` | POST | Validate vial QR and get blockchain status |

### Citizen Portal

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/customer/register` | POST | Register new citizen with Aadhaar |
| `/api/customer/login` | POST | Authenticate citizen |
| `/api/customer/book` | POST | Book vaccination appointment |
| `/api/aadhaar/verify` | POST | Verify Aadhaar and generate ABHA |

### AI & Voice

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/ai/chat` | POST | Multilingual chatbot interaction |
| `/api/voice/stt` | POST | Speech to text conversion |
| `/api/voice/tts` | POST | Text to speech in regional language |

### Blockchain & IoT

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/chain/record` | POST | Record violation event on Ethereum |
| `/chain/verify/:shipmentId` | GET | Get on-chain violation history |
| `/iot/telemetry` | POST | Ingest sensor telemetry data |

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
| **Normal** | Shipment with no violations — vaccine verified safe ✅ |
| **Cold Breach** | Temperature exceeds 8°C — triggers blockchain alert ⚠️ |
| **Tamper + Deviation** | Lid opened + route deviation detected 🚨 |
| **Geofence Breach** | GPS outside permitted delivery area 📍 |

### Vaccination Centers

PHC Andheri · PHC Bandra · CHC Dadar · UHC Kurla · PHC Goregaon · PHC Mulund · PHC Powai · PHC Vikhroli

---

## 👥 Team

<div align="center">

### Team: Code Of Duty 🇮🇳

| Member | Role |
|--------|------|
| **Arnav Kadhe** | Team Leader & Blockchain Developer |
| **Mahir Kachwala** | Frontend Developer |
| **Arindam Dwivedi** | Backend Developer |
| **Rohan Suri** | IoT & Hardware Developer |
| **Rohan Kanse** | Full Stack Developer |

</div>

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **[Sarvam AI](https://www.sarvam.ai/)** — Multilingual STT/TTS/Translation APIs
- **[AI4Bharat](https://ai4bharat.iitm.ac.in/)** — IndicWav2Vec and IndicTrans2 models
- **[Mappls](https://www.mappls.com/)** — India-centric mapping solution
- **[Ethereum](https://ethereum.org/)** — Blockchain infrastructure
- **[Hardhat](https://hardhat.org/)** — Smart contract development toolkit

---

<div align="center">

**Made with ❤️ for Rural India**

[⬆ Back to Top](#-swasthya-setu)

</div>
