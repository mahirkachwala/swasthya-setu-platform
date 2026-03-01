# 🏥 Swasthya Setu - Customer App

<div align="center">

![Flutter](https://img.shields.io/badge/Flutter-3.7+-02569B?style=for-the-badge&logo=flutter&logoColor=white)
![Dart](https://img.shields.io/badge/Dart-2.19+-0175C2?style=for-the-badge&logo=dart&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Ethereum](https://img.shields.io/badge/Ethereum-Blockchain-3C3C3D?style=for-the-badge&logo=ethereum&logoColor=white)

**Mobile app for citizens to book vaccination appointments, verify vaccine authenticity, and access AI-powered multilingual health assistance**

</div>

---

## 🏆 ACM AfterMath Hackathon 2026

This project was built during the **ACM AfterMath Hackathon 2026** by **Team Bhartiya Java Party**.

### 👥 Team Members

| Member | Role |
|--------|------|
| **Mahir Kachwala** | Full Stack Developer & Team Lead |
| **Arnav Kadhe** | Backend Developer |
| **Atharv Kanase** | Frontend Developer |
| **Vedant Hande** | Blockchain & IoT Developer |

---

## 📱 App Screenshots

<div align="center">

| Home & Records | Profile | ABHA Card | AI Chatbot |
|----------------|---------|-----------|------------|
| <img src="../assets/screenshots/citizen-home.png" width="180"/> | <img src="../assets/screenshots/profile.png" width="180"/> | <img src="../assets/screenshots/abha-card.png" width="180"/> | <img src="../assets/screenshots/ai-chatbot.png" width="180"/> |

</div>

---

## ✨ Features

- 🆔 **Aadhaar Verification** - KYC with automatic ABHA card generation
- 📍 **Center Finder** - Interactive map with vaccination centers (Mappls SDK)
- 📅 **Appointment Booking** - Voice or text-based booking
- 💬 **AI Chatbot** - Multilingual health assistant (10+ Indian languages)
- 📊 **Health Records** - Vaccine history, vitals, insights
- 🔐 **Secret Vault** - PIN-protected document storage
- 👨‍👩‍👧 **Family Management** - Book for family members
- 📜 **QR Verification** - Scan vial QR for blockchain-verified authenticity

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| **Mobile App** | Flutter 3.7+, Dart 2.19+ |
| **Backend** | Node.js 20, Express.js |
| **Database** | MongoDB |
| **Blockchain** | Ethereum (Solidity), Hardhat |
| **AI/Voice** | Sarvam AI, Google Gemini |
| **Maps** | Mappls SDK (MapmyIndia) |

---

## ⛓️ Blockchain Smart Contract

### VialLedger.sol - Complete Code

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

### How It Works

1. **Record Violations**: IoT sensors detect temperature breaches, tampering, or route deviations
2. **Hash & Store**: Event data is hashed (SHA256) and stored on Ethereum blockchain
3. **Immutable Audit**: Each violation creates an immutable record with timestamp
4. **QR Verification**: Citizens scan QR codes to see complete shipment history
5. **SAFE/UNSAFE Verdict**: App displays blockchain-verified vaccine integrity status

---

## 🚀 Getting Started

### Prerequisites

- Flutter 3.7+
- Dart 2.19+
- Android Studio / VS Code
- Node.js 20+ (for backend)

### Installation

```bash
# Clone the repository
git clone https://github.com/AfterMath-2026/AfterMath_Bhartiya-Java-Party_Humanity.git
cd AfterMath_Bhartiya-Java-Party_Humanity/Customer

# Get Flutter dependencies
flutter pub get

# Run the app
flutter run

# For backend (in separate terminal)
cd Server
npm install
node index.js
```

---

## 📄 License

This project is licensed under the MIT License.

---

<div align="center">

**Made with ❤️ for Rural India | ACM AfterMath Hackathon 2026**

</div>
