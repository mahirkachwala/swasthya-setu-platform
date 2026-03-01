# Instructions for Friend (Rural User App Developer)

## Goal

When a user books an appointment in your app, it must **appear on the doctor's portal** on a different computer. Both must be interconnected via the shared backend.

---

## 1. Backend URL (Critical)

**You must use the same backend URL as the doctor portal.**

- **Development:** `http://localhost:8000` (if both run on same network)
- **Production:** `http://YOUR_SERVER_IP:8000` or `https://your-domain.com`

**Update in your app:** `lib/globals.dart`

```dart
final String tunneldomain = "http://YOUR_SERVER_IP:8000";  // Ask your teammate for this
```

---

## 2. How to Book an Appointment (API)

When the user completes a booking (via voice bot or manual form), call:

```
POST {tunneldomain}/api/appointments
Content-Type: application/json

{
  "aadhaarHash": "HASHED_12DIGIT",  // optional if aadhaarMasked provided
  "aadhaarMasked": "XXXX-XXXX-1234",  // optional, shown on doctor portal
  "centerId": "PHC-102",
  "centerName": "Primary Health Center, Village X",
  "lat": 19.076,
  "lng": 72.877,
  "slot": "10:30-11:00",
  "dose": 1,
  "language": "hi"
}
```

**Response:**
```json
{
  "ok": true,
  "appointmentId": "...",
  "txHash": "0x...",
  "message": "Appointment created and recorded on chain."
}
```

**Result:** The appointment appears on the doctor's dashboard within seconds.

---

## 3. Aadhaar Verification (Both Sides)

### Your Side (User App)

- **Signup:** User enters Aadhaar, receives OTP. Call existing `/database/generateotp` and `/database/signup`.
- **On booking:** Send `aadhaarHash` (SHA256 of Aadhaar) or `aadhaarMasked` (e.g. `XXXX-XXXX-1234`) for privacy.
- **Storage:** Store Aadhaar in SharedPreferences after login (already done).

### Doctor Side

- Doctor sees `aadhaarMasked` in the appointment list.
- Doctor can verify identity via backend (e.g. OTP check or UIDAI if integrated).

### What to Send

| Field | Format | Example |
|-------|--------|---------|
| `aadhaarHash` | SHA256 of 12-digit Aadhaar | `"a1b2c3..."` |
| `aadhaarMasked` | Last 4 digits visible | `"XXXX-XXXX-1234"` |

Use one or both. Doctor portal will display masked for privacy.

---

## 4. Vaccination Centers

- **Get centers:** `GET {tunneldomain}/database/...` (check existing endpoints) or `VaccinationCenters` model.
- **Nearest center:** Use user's GPS (geolocator) + center list to find nearest.
- **Google Maps:** Use `url_launcher` or `google_maps_flutter` to open directions.

---

## 5. Summary – What You Must Do

1. **Set `tunneldomain`** in `lib/globals.dart` to the shared backend URL.
2. **On booking:** Call `POST /api/appointments` with the JSON above.
3. **Aadhaar:** Send `aadhaarHash` or `aadhaarMasked` with each booking.
4. **Verify:** After booking, the doctor's portal will show the appointment. No extra steps.

---

## 6. Testing the Link

1. Run the backend (doctor's side): `cd doctor-portal/Server && npm start`
2. Open doctor dashboard: `http://localhost:8000/dashboard/`
3. In your app, book an appointment (use "Test: Create appointment" button or your voice/form)
4. Refresh the doctor dashboard – the appointment should appear in the "Appointments" section.

---

## 7. Contact

If the backend URL or API changes, your teammate will share the updated `tunneldomain` and endpoint details.
