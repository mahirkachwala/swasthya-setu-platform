# Cold Chain Demo

**ACM Aftermath Hackathon** — developed by **Bhartiya Java Party**.

This repository contains the demo and showcase portion of our vaccine cold-chain monitoring project. It includes the backend API and the control dashboard used to run three scenarios (geofence deviation, pressure anomaly, and manual sensor breach) with per-vial QR code verification. The demo runs with **mock blockchain** by default so you can try it without any chain or wallet setup.

---

## What’s in this repo

- **server** — Node.js backend (Express, MongoDB). Ingests telemetry, detects anomalies, and records events. Uses mock chain unless configured otherwise.
- **demo** — Web dashboard on port 5000: three vial cards with QR codes, scenario selector, timer, and live log. Each QR encodes a text-only report (no URL); scan with a phone to see status and anomaly details.

The full system may include other components (e.g. mobile app, hardware); this repo holds only what’s needed to run and present the demo.

---

## Run the demo

**Requirements:** Node.js, MongoDB (local or a connection string).

1. **Backend**
   - Copy `server/.env.example` to `server/.env` and set `MONGO_URI` if needed (default: `mongodb://127.0.0.1:27017/coldchain`). Keep `USE_MOCK_CHAIN=true` for the demo.
   - From the project root:
     ```bash
     cd server && npm install && node index.js
     ```
   - Server listens on port 8000.

2. **Dashboard**
   - In another terminal:
     ```bash
     cd demo && npm install && node server.js
     ```
   - Open **http://localhost:5000**.

3. **Use the demo**
   - Pick a scenario (Geofence, Pressure, or Manual), click **Start simulation**, and follow the on-screen prompts. Scan the QR codes with your phone to view the live report (choose “View text” or “Copy” when the scanner offers it).

---

## Scenarios

| Scenario   | Vial   | What happens                          |
|-----------|--------|----------------------------------------|
| Geofence  | VIAL-001 | Simulated route leaves the geofence at ~30 s. |
| Pressure  | VIAL-002 | Simulated pressure anomaly at ~30 s.   |
| Manual    | VIAL-003 | No timer; optional hardware can send real temperature data. |

Anomalies appear in the live log and in the QR report. With mock chain, no real transactions are sent; the UI still shows event hashes for illustration.
