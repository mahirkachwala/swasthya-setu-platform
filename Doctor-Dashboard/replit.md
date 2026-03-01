# Swasthya Setu

## Overview
A professional clinic dashboard for the Swasthya Setu vaccine management system, linked to a citizen-facing booking portal. Built with an Eka Care-style purple medical theme featuring ABHA/Aadhaar integration, real-time queue management, and live appointment sync from the citizen portal.

## Tech Stack
- **Frontend:** React + Vite + TailwindCSS + shadcn/ui + wouter routing + TanStack Query
- **Backend:** Express.js (Node.js) with in-memory storage (MemStorage)
- **Theme:** Purple medical theme (HSL 262) matching Eka Care/ABHA app design

## Architecture
- `shared/schema.ts` - All TypeScript types and Zod schemas
- `server/storage.ts` - MemStorage with seeded demo data (appointments, inventory, shipments, customers)
- `server/routes.ts` - REST API endpoints (doctor + customer APIs)
- `client/src/App.tsx` - Main app with sidebar layout, routing, and CenterProvider context
- `client/src/contexts/center-context.tsx` - Global React context for selected doctor and center (shared across header, queue, patients, profile)
- `client/src/components/app-sidebar.tsx` - Icon+text sidebar navigation (Eka Care style)
- `client/src/pages/` - All page components

## Pages
1. **Queue** (`/`) - Center-filtered queue with tabs (Booked/Checked In/Completed/All), center badge pill, search, patient cards with CITIZEN source badge, check-in/vaccinate actions. Empty state shows "No appointments for [center name]"
2. **Patients** (`/patients`) - Center-filtered table with Seq, Patient Details, Contact, ABHA ID, Aadhaar, Vaccines, Visits columns and center badge
3. **Inventory** (`/inventory`) - Stock levels with progress bars, low stock alerts, reorder form
4. **Shipments** (`/shipments`) - Shipment list with real-time tracking timeline, simulation controls
5. **QR Scan** (`/qr-scan`) - Vial QR code scanning (demo mode with presets)
6. **Analytics** (`/analytics`) - KPI stat cards, alert system, capacity gauge, vaccine stock overview, quick actions
7. **My Account** (`/profile`) - Doctor profile with switch doctor/switch PHC dialogs (global context), edit profile, schedule & slot settings, language selection, ABHA/Aadhaar verification, ABDM integration, security settings
8. **Citizen Portal** (`/citizen`) - Standalone citizen booking portal (no sidebar), register/login/book flow that syncs appointments to doctor queue in real-time. Shows active vs past bookings with live status polling. Past bookings (VACCINATED/CANCELLED) are visually disposed with opacity and strikethrough.

## API Endpoints
### Doctor Dashboard
- `GET /api/dashboard/:centerId` - Dashboard stats + alerts
- `GET /api/appointments?centerId=&date=` - List appointments (filtered by center)
- `PATCH /api/appointments/:id` - Update appointment status
- `GET /api/patients?centerId=` - List patients (filtered by center)
- `GET /api/inventory?centerId=` - List inventory
- `POST /api/inventory/reorder` - Create reorder shipment
- `GET /api/shipments?centerId=` - List shipments
- `POST /api/sim/start?shipmentId=` - Start shipment tracking simulation
- `POST /api/qr/scan` - QR vial scan verification
- `GET /api/alerts?centerId=` - Get alerts

### Citizen Portal
- `POST /api/customer/register` - Register customer with Aadhaar
- `POST /api/customer/login` - Customer login
- `POST /api/customer/book` - Book appointment (routed to specific center's doctor queue)
- `GET /api/customer/bookings/:aadhaarId` - Get customer's bookings with live status
- `GET /api/centers` - List vaccination centers

## Center-Specific Filtering
- Doctor/center selection stored in global React context (CenterProvider)
- Queue page filters appointments by selected center ID
- Patients page filters patients by selected center ID
- Header dynamically shows selected center name and doctor name
- Switching centers via Profile page updates all views globally

## Citizen-Doctor Sync Flow
1. Citizen books appointment at a specific center (e.g., PHC Bandra)
2. Appointment appears in doctor queue only when that center is selected
3. Doctor marks appointment as VACCINATED/CANCELLED → DISPOSED
4. Citizen portal polls bookings every 3 seconds and shows updated status
5. Completed/cancelled/disposed bookings move to "Past Appointments" section (faded, strikethrough)

## Timezone Handling
- All date calculations use IST (Asia/Kolkata) timezone via `Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' })`
- This ensures consistency between dashboard date filters, booking form dates, and seeded data
- SlotTimes are stored with +05:30 offset and matched using `startsWith(YYYY-MM-DD)`

## Demo Data
- Default Center: PHC Andheri (CEN-001)
- Default Doctor: Dr. Rajesh Sharma (DOC-001)
- 7 seeded appointments with mixed statuses (BOOKED, CHECKED_IN, VACCINATED, DISPOSED)
- 3 vaccine types (Covishield, Covaxin, Sputnik V)
- 3 shipments (in-transit, arrived, created)
- Pre-registered customer (Aadhaar: 123456789012, password: pass123, name: Ravi Patil)
- 4 switchable doctors (DOC-001 to DOC-004)
- 4 switchable centers (CEN-001 to CEN-004)
- No payment features
