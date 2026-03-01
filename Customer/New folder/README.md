# Rural User App

Flutter Android app for rural citizens – voice bot (Sarvam AI), appointment booking, nearest vaccination center.

## Setup

```bash
flutter pub get
```

## Run

```bash
flutter run
```

## Backend URL

Update `lib/globals.dart` – set `tunneldomain` to your Server URL (e.g. `http://YOUR_IP:8000`).

## Features

- **Voice** – Chat/voice bot (replace Dialogflow with Sarvam AI)
- **Book** – Appointment booking → syncs to doctor portal via blockchain
- **Centers** – Nearest vaccination centers (integrate Google Maps)
- **Profile** – User profile

See `RURAL_APP_HANDOFF.md` for full development guide.
