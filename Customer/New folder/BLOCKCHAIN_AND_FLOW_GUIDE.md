# Blockchain, Flow & Friend Integration – Complete Guide

---

## 1. Will Blockchain Work in Cursor? Do You Need to Change IDs?

**Short answer:** Cursor is just an IDE – it does not affect blockchain. No ID changes needed for Cursor.

**Current setup:**
- **Mock mode (default):** When the chain service (`http://localhost:3001`) is not running, the backend uses a **mock** – it generates a fake `txHash` and stores it. Everything works for demo; no real blockchain.
- **Real blockchain:** Run the chain service (or a real ethers/Hardhat service) and set `CHAIN_SERVICE_URL`. Then events are written to a real chain (e.g. Sepolia).

**IDs (shipmentId, vialId, aadhaarHash):** These are normal strings. No special format needed for Cursor or blockchain. Use `VIAL-001`, `SHIP-2026-001`, etc.

---

## 2. Friend’s Flow: Appointment → Blockchain → Your Display

### What Your Friend Must Do

1. **Use the same backend URL as you**
   - Set `tunneldomain` in `lib/globals.dart` to your backend (e.g. `http://YOUR_IP:8000`).
   - If you run the backend on your laptop, your friend uses your laptop’s IP.

2. **Call the appointment API when the user books**
   ```dart
   POST {tunneldomain}/api/appointments
   Content-Type: application/json

   {
     "aadhaarMasked": "XXXX-XXXX-1234",
     "centerId": "PHC-102",
     "centerName": "Primary Health Center",
     "slot": "10:30-11:00",
     "dose": 1,
     "language": "hi"
   }
   ```

3. **That’s it.** The backend will:
   - Store the appointment in MongoDB
   - Append it to the audit chain
   - Call the chain service (mock or real)
   - Return `txHash`

4. **Your dashboard** fetches `GET /api/appointments` every 10 seconds, so new appointments appear automatically.

### Network Setup (Different Computers)

| Scenario | Setup |
|----------|--------|
| Same Wi‑Fi | Run backend on your PC. Friend uses `http://YOUR_LOCAL_IP:8000`. |
| Different networks | Deploy backend to a cloud server (e.g. Railway, Render, AWS). Both use that URL. |
| Local testing | Both use `http://localhost:8000` only if they run on the same machine. |

---

## 3. Simulation: What Can Go Wrong & How It’s Reported

### Breach Types

| Breach | Trigger | Recorded As | QR Shows |
|--------|---------|-------------|----------|
| **Temperature** | temp &lt; 2°C or &gt; 8°C | COLD_CHAIN_BREACH | ⚠ NOT USABLE |
| **Pressure** | pressure outside 900–1100 hPa | PRESSURE_ANOMALY | ⚠ NOT USABLE |
| **Tampering** | lidOpen=true or shock&gt;0 | TAMPER_LID_OPEN / TAMPER_SHOCK | ⚠ NOT USABLE |
| **Geofence** | GPS outside route corridor | ROUTE_DEVIATION | ⚠ NOT USABLE |

### How It’s Reported

1. Simulator sends telemetry with a breach (e.g. temp=14).
2. Backend detects it and creates an Event.
3. Event is appended to the audit chain and sent to the chain service.
4. Shipment status is set to `ALERT`.
5. When the doctor scans the vial QR, `GET /api/vial/{vialId}` returns all events and `usable: false`.

### How the QR “Updates”

The QR code itself does not change. It encodes a fixed URL like `https://your-domain/track/VIAL-005`.

- **Before breach:** Scan → backend returns normal data, `usable: true`.
- **After breach:** Scan → backend returns events + `usable: false` → doctor sees “Vial not usable”.

The data behind the URL is updated; the QR stays the same.

---

## 4. What to Share With Your Friend

Share the **`rural-user-app/`** folder and **`FRIEND_INSTRUCTIONS.md`**.

### Checklist for Your Friend

- [ ] Set `tunneldomain` in `lib/globals.dart` to your backend URL.
- [ ] On booking, call `POST /api/appointments` with the JSON above.
- [ ] Include `aadhaarMasked` (e.g. `XXXX-XXXX-1234`).
- [ ] Test: book an appointment → it should appear on your dashboard within ~10 seconds.

### Your Backend URL

Give your friend the exact URL, for example:
- `http://192.168.1.100:8000` (your local IP)
- `https://your-app.onrender.com` (if deployed)

---

## 5. Running the Full Demo

**Terminal 1 – Backend:**
```bash
cd doctor-portal/Server
npm start
```

**Terminal 2 – 10‑vial simulation (breaches):**
```bash
cd doctor-portal/simulator
node simulator_ten_vials.js http://localhost:8000
```

**Browser:** Open `http://localhost:8000/dashboard/`

- Select VIAL-005 (temperature breach).
- Enter VIAL-005 in the QR scan box → see “NOT USABLE”.
- Appointments from your friend’s app appear in the list.
