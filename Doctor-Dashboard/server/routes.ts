import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAppointmentSchema, qrScanSchema, reorderSchema } from "@shared/schema";
import { randomUUID } from "crypto";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get("/api/dashboard/:centerId", async (req, res) => {
    const stats = await storage.getDashboardStats(req.params.centerId);
    res.json(stats);
  });

  app.get("/api/appointments", async (req, res) => {
    const centerId = (req.query.centerId as string) || "CEN-001";
    const date = req.query.date as string | undefined;
    const appointments = await storage.getAppointments(centerId, date);
    res.json(appointments);
  });

  app.post("/api/appointments", async (req, res) => {
    const parsed = insertAppointmentSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.message });
    }
    const appointment = await storage.createAppointment(parsed.data);
    res.status(201).json(appointment);
  });

  app.patch("/api/appointments/:id", async (req, res) => {
    const { status } = req.body;
    if (!["BOOKED", "CHECKED_IN", "VACCINATED", "CANCELLED", "DISPOSED"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    const updated = await storage.updateAppointmentStatus(req.params.id, status);
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  });

  app.get("/api/inventory", async (req, res) => {
    const centerId = (req.query.centerId as string) || "CEN-001";
    const inventory = await storage.getInventory(centerId);
    res.json(inventory);
  });

  app.post("/api/inventory/reorder", async (req, res) => {
    const parsed = reorderSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.message });
    }
    const { centerId, manufacturer, vaccineType, quantity } = parsed.data;
    const center = await storage.getCenter(centerId);
    if (!center) return res.status(404).json({ error: "Center not found" });

    const shipmentId = `SHIP-${String(Date.now()).slice(-5)}`;
    const batchNo = `BATCH-2026-${String(Math.floor(Math.random() * 900) + 100)}`;

    const originMap: Record<string, { name: string; lat: number; lng: number }> = {
      "Serum Institute": { name: "Pune Plant", lat: 18.5204, lng: 73.8567 },
      "Bharat Biotech": { name: "Hyderabad Plant", lat: 17.3850, lng: 78.4867 },
      "Dr. Reddy's": { name: "Hyderabad Lab", lat: 17.4065, lng: 78.4772 },
    };

    const origin = originMap[manufacturer] || { name: "Mumbai Warehouse", lat: 19.0760, lng: 72.8777 };

    const shipment = await storage.createShipment({
      shipmentId,
      manufacturer,
      batchNo,
      vaccineType,
      quantity,
      originName: origin.name,
      originLat: origin.lat,
      originLng: origin.lng,
      destinationCenterId: centerId,
      destinationName: center.name,
      status: "CREATED",
      currentCheckpoint: origin.name,
      currentLat: origin.lat,
      currentLng: origin.lng,
      checkpoints: [
        { name: origin.name, lat: origin.lat, lng: origin.lng, etaSec: 0, reached: false },
        { name: "Regional Hub", lat: (origin.lat + center.lat) / 2, lng: (origin.lng + center.lng) / 2, etaSec: 10, reached: false },
        { name: "District Center", lat: center.lat - 0.05, lng: center.lng - 0.05, etaSec: 20, reached: false },
        { name: center.name, lat: center.lat, lng: center.lng, etaSec: 30, reached: false },
      ],
      lastUpdateTs: new Date().toISOString(),
    });

    res.status(201).json({ shipmentId: shipment.shipmentId, status: shipment.status });
  });

  app.get("/api/shipments", async (req, res) => {
    const centerId = (req.query.centerId as string) || "CEN-001";
    const shipments = await storage.getShipments(centerId);
    res.json(shipments);
  });

  app.get("/api/shipments/:shipmentId", async (req, res) => {
    const shipment = await storage.getShipment(req.params.shipmentId);
    if (!shipment) return res.status(404).json({ error: "Not found" });
    res.json(shipment);
  });

  app.post("/api/sim/start", async (req, res) => {
    const shipmentId = req.query.shipmentId as string;
    if (!shipmentId) return res.status(400).json({ error: "shipmentId required" });
    const ok = await storage.startSimulation(shipmentId);
    if (!ok) return res.status(404).json({ error: "Shipment not found or already completed" });
    res.json({ ok: true, message: `Simulation started for ${shipmentId}` });
  });

  app.post("/api/qr/scan", async (req, res) => {
    const parsed = qrScanSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.message });
    }
    const parts = parsed.data.qrPayload.split("|");
    const shipmentId = parts[0] || "UNKNOWN";
    res.json({
      ok: true,
      shipmentId,
      batchNo: parts[1] || "UNKNOWN",
      message: "Accepted (demo). Blockchain validation handled separately.",
    });
  });

  app.get("/api/centers/:centerId", async (req, res) => {
    const center = await storage.getCenter(req.params.centerId);
    if (!center) return res.status(404).json({ error: "Not found" });
    res.json(center);
  });

  app.get("/api/alerts", async (req, res) => {
    const centerId = (req.query.centerId as string) || "CEN-001";
    const alerts = await storage.getAlerts(centerId);
    res.json(alerts);
  });

  app.get("/api/patients", async (req, res) => {
    const centerId = (req.query.centerId as string) || "CEN-001";
    const patients = await storage.getPatients(centerId);
    res.json(patients);
  });

  app.get("/api/centers", async (_req, res) => {
    const centers = await storage.getCenters();
    const result = await Promise.all(centers.map(async (c) => {
      const centerAppointments = await storage.getAppointments(c.centerId);
      const bookedCount = centerAppointments.filter(a => a.status === "BOOKED").length;
      return { ...c, openSlots: Math.max(0, c.openSlots - bookedCount) };
    }));
    res.json({ centers: result });
  });

  app.post("/api/customer/register", async (req, res) => {
    const { aadhaarId, name, phone, password } = req.body;
    if (!aadhaarId || !name || !password) {
      return res.status(400).json({ error: "aadhaarId, name, and password are required" });
    }
    const existing = await storage.getCustomerByAadhaar(aadhaarId);
    if (existing) return res.status(409).json({ error: "User already registered" });

    const customer = await storage.registerCustomer(aadhaarId, name, phone || "", password);
    res.json({ success: true, user: { id: customer.id, name: customer.name, aadhaarId: customer.aadhaarId } });
  });

  app.post("/api/customer/login", async (req, res) => {
    const { aadhaarId, password } = req.body;
    if (!aadhaarId || !password) {
      return res.status(400).json({ error: "aadhaarId and password required" });
    }
    const customer = await storage.getCustomerByAadhaar(aadhaarId);
    if (!customer) return res.status(404).json({ error: "User not found" });
    if (customer.password !== password) return res.status(401).json({ error: "Incorrect password" });

    res.json({
      success: true,
      user: { id: customer.id, name: customer.name, aadhaarId: customer.aadhaarId, vaccinated: customer.vaccinated },
    });
  });

  app.post("/api/customer/book", async (req, res) => {
    const { aadhaarId, patientName, phone, centerId, slotTime, vaccineType, dose } = req.body;
    if (!aadhaarId || !patientName || !centerId || !slotTime || !vaccineType) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const center = await storage.getCenter(centerId);
    if (!center) return res.status(404).json({ error: "Center not found" });

    const appointmentId = `APT-${String(Date.now()).slice(-6)}`;
    const maskedAadhaar = `XXXX-XXXX-${aadhaarId.slice(-4)}`;

    const appointment = await storage.createAppointment({
      appointmentId,
      aadhaarId: maskedAadhaar,
      patientName,
      phone: phone || "",
      centerId,
      centerName: center.name,
      slotTime,
      vaccineType,
      dose: dose || 1,
      aadhaarVerified: true,
      abhaStatus: "verified",
      status: "BOOKED",
      source: "customer",
    });

    res.json({
      success: true,
      appointment: {
        appointmentId: appointment.appointmentId,
        centerName: center.name,
        slot: slotTime,
        dose: dose || 1,
        status: appointment.status,
        qrData: `${appointment.appointmentId}|${centerId}|${vaccineType}`,
      },
    });
  });

  app.get("/api/customer/bookings/:aadhaarId", async (req, res) => {
    const { aadhaarId } = req.params;
    const bookings = await storage.getAppointmentsByAadhaar(aadhaarId);
    res.json(bookings.map(b => ({
      appointmentId: b.appointmentId,
      centerName: b.centerName,
      centerId: b.centerId,
      slot: b.slotTime,
      vaccineType: b.vaccineType,
      dose: b.dose,
      status: b.status,
    })));
  });

  return httpServer;
}
