# Swasthya Setu

A vaccine cold chain integrity and rural healthcare platform with IoT telemetry, blockchain-anchored audit logs, and multilingual AI assistance.

---

## Table of Contents

- [Problem](#problem)
- [Solution](#solution)
- [System Architecture](#system-architecture)
- [Data Flow](#data-flow)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [API Overview](#api-overview)
- [Blockchain Integration](#blockchain-integration)
- [Screenshots](#screenshots)
- [Contributors](#contributors)
- [License](#license)

---

## Problem

Vaccine distribution in India faces significant operational challenges:

- **Cold chain failures** lead to vaccine wastage when temperature excursions go undetected
- **Lack of real-time visibility** into shipment conditions during transit
- **No verifiable audit trail** for end consumers to confirm vaccine integrity
- **Language barriers** prevent rural users from accessing healthcare applications effectively

---

## Solution

Swasthya Setu addresses these challenges through:

1. **IoT-based monitoring** - ESP32 devices with temperature sensors stream telemetry data in real-time
2. **Automated violation detection** - Backend processes telemetry and flags temperature breaches, tampering, and route deviations
3. **Blockchain anchoring** - Critical violation events are hashed and recorded on Ethereum for immutable audit trails
4. **Multilingual AI assistant** - Voice-enabled chatbot supporting 10+ Indian languages via Sarvam AI and Google Gemini

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              SWASTHYA SETU                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────────────────────┐ │
│   │  ESP32 + DHT │───▶│   Backend    │───▶│  MongoDB                     │ │
│   │  (IoT Device)│    │  (Node.js)   │    │  - Telemetry collection      │ │
│   └──────────────┘    └──────┬───────┘    │  - Violation events          │ │
│                              │            │  - User data                 │ │
│                              │            └──────────────────────────────┘ │
│                              │                                             │
│                              ▼                                             │
│                    ┌──────────────────┐                                    │
│                    │  Ethereum        │                                    │
│                    │  (Sepolia)       │                                    │
│                    │  - VialLedger    │                                    │
│                    │    contract      │                                    │
│                    └──────────────────┘                                    │
│                                                                             │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────────────────────┐ │
│   │ Flutter App  │◀──▶│   Backend    │◀──▶│  React Dashboard             │ │
│   │ (Citizens)   │    │   REST API   │    │  (Healthcare Workers)        │ │
│   └──────────────┘    └──────────────┘    └──────────────────────────────┘ │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │  AI Pipeline: Sarvam STT → Gemini LLM → Sarvam TTS                  │  │
│   │  Languages: Hindi, Marathi, Tamil, Telugu, Bengali, Gujarati, etc.  │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### Telemetry Ingestion

```
ESP32 Device → POST /iot/telemetry → Backend validates → MongoDB insert
                                          ↓
                              If violation detected:
                                          ↓
                              Hash event → Record on Ethereum
```

### Verification Request

```
User scans QR → GET /chain/verify/:shipmentId → Query Ethereum
                                                      ↓
                                          Return SAFE/UNSAFE verdict
                                          with violation history
```

### AI Chatbot

```
Voice input → Sarvam STT → Translate to English → Gemini LLM
                                                       ↓
                              Translate response → Sarvam TTS → Voice output
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Mobile App | Flutter 3.7+, Dart |
| Backend | Node.js 20, Express.js |
| Database | MongoDB |
| Blockchain | Ethereum (Sepolia), Solidity, Hardhat |
| AI/ML | Google Gemini 2.5 Flash, Sarvam AI |
| Dashboard | React, Vite, TailwindCSS |
| Maps | Mappls SDK |
| IoT | ESP32, DHT22 sensor |

---

## Installation

### Prerequisites

- Node.js 20+
- Flutter 3.7+
- MongoDB (local or Atlas)
- MetaMask wallet (for blockchain features)

### Backend

```bash
cd Customer/Server
npm install
cp .env.example .env
# Configure environment variables
node index.js
```

### Flutter App

```bash
cd Customer
flutter pub get
flutter run
```

### Dashboard

```bash
cd Doctor-Dashboard
npm install
npm run dev
```

### Blockchain (Optional)

```bash
cd Customer/blockchain
npm install
npx hardhat compile
npx hardhat run scripts/deploy.js --network sepolia
```

---

## API Overview

### Telemetry

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/iot/telemetry` | POST | Submit device telemetry |
| `/vial/:shipmentId` | GET | Get shipment status |

### Blockchain

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/chain/verify/:shipmentId` | GET | Verify shipment on-chain |

### Chatbot

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/chatbot/voice` | POST | Process voice input |
| `/chatbot/text` | POST | Process text input |

### Appointments

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/appointments` | GET | List user appointments |
| `/appointments` | POST | Book new appointment |

---

## Blockchain Integration

### Smart Contract: VialLedger

The `VialLedger.sol` contract stores violation records immutably on Ethereum.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract VialLedger {
    struct ViolationRecord {
        bytes32 eventHash;
        string eventType;
        uint256 timestamp;
        uint256 blockTs;
    }

    mapping(string => ViolationRecord[]) private shipmentViolations;

    event ViolationRecorded(
        string indexed shipmentId,
        bytes32 eventHash,
        string eventType,
        uint256 timestamp
    );

    function recordViolation(
        string calldata shipmentId,
        bytes32 eventHash,
        string calldata eventType,
        uint256 timestamp
    ) external {
        shipmentViolations[shipmentId].push(ViolationRecord({
            eventHash: eventHash,
            eventType: eventType,
            timestamp: timestamp,
            blockTs: block.timestamp
        }));

        emit ViolationRecorded(shipmentId, eventHash, eventType, timestamp);
    }

    function getViolationCount(string calldata shipmentId) external view returns (uint256) {
        return shipmentViolations[shipmentId].length;
    }

    function getViolation(string calldata shipmentId, uint256 index) external view returns (
        bytes32 eventHash,
        string memory eventType,
        uint256 timestamp,
        uint256 blockTs
    ) {
        ViolationRecord storage v = shipmentViolations[shipmentId][index];
        return (v.eventHash, v.eventType, v.timestamp, v.blockTs);
    }
}
```

### Contract Functions

| Function | Description |
|----------|-------------|
| `recordViolation()` | Stores a violation event hash with metadata |
| `getViolationCount()` | Returns total violations for a shipment |
| `getViolation()` | Retrieves violation details by index |

### Event Types

| Event | Trigger |
|-------|---------|
| `COLD_CHAIN_BREACH` | Temperature outside 2-8°C range |
| `TAMPER_LID_OPEN` | Container lid opened during transit |
| `TAMPER_SHOCK` | Physical shock detected |
| `ROUTE_DEVIATION` | GPS location outside permitted geofence |

### How It Works

1. IoT device streams telemetry to backend
2. Backend detects violation (e.g., temperature > 8°C)
3. Violation event is hashed: `keccak256(shipmentId + eventType + timestamp)`
4. Hash is recorded on Ethereum via `recordViolation()`
5. When user scans QR code, backend queries contract for all violations
6. Returns `SAFE` (zero violations) or `UNSAFE` (violations found) with details

---

## Screenshots

*Screenshots to be added.*

---

## Contributors

| Name | Contributions |
|------|---------------|
| Mahir Kachwala | Backend, frontend integration, AI pipeline |
| Arnav Kadhe | Smart contract development, blockchain integration |

---

## License

MIT License. See [LICENSE](LICENSE) for details.

---

*Built during ACM AfterMath Hackathon 2026.*
