# Rural User App – Handoff for Development

**Purpose:** Android app for rural users – voice bot (Sarvam AI), appointment booking, nearest vaccination center, multilingual, low-end device support.

---

## What to Build

| Feature | Description | Hook / API |
|---------|-------------|------------|
| **Sarvam AI voice bot** | Replace Dialogflow. Voice call–style flow: user speaks → Sarvam STT → backend `/ai/chat` → Sarvam TTS → user hears. Multilingual (Hindi, Marathi, etc.). | `POST /ai/chat` (you implement) |
| **Book appointment** | User books slot at nearest center. | `POST /api/appointments` |
| **Nearest center** | Show vaccination centers on Google Maps, open directions. | `GET /database/...` or VaccinationCenters model |
| **Aadhaar login** | Simplified login (existing flow). | `POST /database/login`, `POST /database/signup` |

---

## What to Remove (Clutter)

- **Leaderboard** – gamification
- **FeedScreen / immunostories / immunogram** – social feed
- **Quiz** – gamification
- **QrPage** – keep only simple “show my QR for identity” if needed
- **Share certificate, invite friend, covid hero** – gamification
- **PostInterface** (web) – doctor side only

---

## API Hooks (Backend URL in `lib/globals.dart`)

### Create appointment (when user books via voice or UI)

```dart
POST {baseUrl}/api/appointments
Content-Type: application/json

{
  "aadhaarHash": "HASHED_12DIGIT",  // or masked Aadhaar for demo
  "centerId": "PHC-102",
  "centerName": "Primary Health Center",
  "lat": 19.076,
  "lng": 72.877,
  "slot": "10:30-11:00",
  "dose": 1,
  "language": "hi"
}

Response: { "ok": true, "appointmentId": "...", "txHash": "0x..." }
```

**Blockchain:** Backend records to audit chain + calls chain service. Doctor portal shows the appointment automatically.

### Sarvam AI (you implement backend proxy)

```
POST {baseUrl}/ai/chat
{ "message": "user text", "language": "hi" }
→ Returns: { "response": "bot reply", "intent": "book_appointment" }
```

Use Sarvam APIs: `/speech-to-text`, `/chat/completions`, `/text-to-speech`, `/translate`.

---

## Simplified Home Structure

Replace current 5-tab `HomePage` with 3 tabs:

1. **Voice** – Sarvam voice bot (tap to talk, book via conversation)
2. **Book** – Manual booking form (center, slot)
3. **Centers** – List + map of nearest vaccination centers

---

## Low-End Android

- `minSdkVersion 21` (keep)
- Avoid heavy animations
- Use `ListView.builder` for lists
- Compress images
- Consider `--split-debug-info` for smaller APK

---

## Files to Share with Friend

- `lib/` (entire folder)
- `android/`
- `ios/` (if needed)
- `pubspec.yaml`
- `assets/`
- This file (`RURAL_APP_HANDOFF.md`)

**Backend:** Update `tunneldomain` in `lib/globals.dart` to your Server URL (e.g. `http://YOUR_IP:8000` or your deployed URL).
