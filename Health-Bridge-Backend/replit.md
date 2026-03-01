# Swasthya Setu Backend

## Overview
Central backend API for the Swasthya Setu appointment management system. Both the customer app and doctor app communicate through this backend - no direct app-to-app communication.

## Architecture
```
Customer App → POST /api/appointments → Backend
Doctor App → GET /api/appointments → Backend
Doctor App → PATCH /api/appointments/:id → Backend
Customer App → GET /api/appointments/:id → Backend
```

## API Endpoints
- `POST /api/appointments` - Create appointment (customer)
- `GET /api/appointments` - Get all appointments (doctor)
- `GET /api/appointments/:id` - Get single appointment (customer)
- `PATCH /api/appointments/:id` - Update status (doctor)
- `GET /api/stats` - Dashboard statistics
- `GET /api/test` - Health check (returns `{ message: "Backend working" }`)

## CORS
Open to all origins (`*`) with all methods (GET, POST, PATCH, PUT, DELETE, OPTIONS).

## Tech Stack
- **Backend:** Express.js with TypeScript
- **Frontend:** React + Vite (admin dashboard)
- **Storage:** @replit/database (persistent key-value store, survives restarts)
- **Styling:** Tailwind CSS + shadcn/ui
- **Validation:** Zod schemas

## Key Files
- `shared/schema.ts` - Appointment types and validation schemas
- `server/routes.ts` - API routes with CORS and verbose logging
- `server/storage.ts` - Replit Database storage (persistent, keys prefixed with `appt_`)
- `client/src/pages/dashboard.tsx` - Admin dashboard
- `client/src/components/theme-provider.tsx` - Dark/light theme support

## Data Model
Appointment: id, name, phone, center, date, status (BOOKED|CONFIRMED|IN_PROGRESS|COMPLETED|CANCELLED), createdAt

## Storage Notes
- Uses Replit Database with `appt_` prefix for all appointment keys
- `db.list()` and `db.get()` return `{ok: true, value: ...}` format - unwrapped via helper functions
- Data persists across restarts and deploys - no instance mismatch issues
