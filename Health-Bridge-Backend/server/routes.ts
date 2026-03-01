import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAppointmentSchema, updateAppointmentSchema } from "@shared/schema";
import cors from "cors";

export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {
  app.use(
    cors({
      origin: "*",
      methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  );

  app.get("/api/test", (_req, res) => {
    console.log("GET /api/test called");
    res.json({ message: "Backend working" });
  });

  app.post("/api/appointments", async (req, res) => {
    console.log("POST received:", JSON.stringify(req.body));
    try {
      const data = {
        name: req.body.name || "",
        phone: req.body.phone || "",
        center: req.body.center || "",
        date: req.body.date || "",
      };
      const appointment = await storage.createAppointment(data);
      console.log("Created appointment:", JSON.stringify(appointment));
      const allAppointments = await storage.getAllAppointments();
      console.log("Full appointments array after push:", JSON.stringify(allAppointments));
      res.json({ success: true, appointment });
    } catch (err: any) {
      console.log("POST error:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/appointments", async (_req, res) => {
    console.log("GET all appointments");
    try {
      const appointments = await storage.getAllAppointments();
      console.log("Returning", appointments.length, "appointments");
      res.json({ appointments });
    } catch (err: any) {
      console.log("GET all error:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/appointments/:id", async (req, res) => {
    console.log("GET single appointment, ID:", req.params.id);
    try {
      const appointment = await storage.getAppointment(req.params.id);
      console.log("Result:", JSON.stringify(appointment || null));
      if (!appointment) {
        return res.status(404).json({ error: "Not found" });
      }
      res.json({ appointment });
    } catch (err: any) {
      console.log("GET single error:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  app.patch("/api/appointments/:id", async (req, res) => {
    console.log("PATCH update, ID:", req.params.id, "New status:", req.body.status);
    try {
      const appointment = await storage.updateAppointmentStatus(
        req.params.id,
        req.body.status,
      );
      if (!appointment) {
        return res.status(404).json({ error: "Not found" });
      }
      console.log("Updated appointment:", JSON.stringify(appointment));
      res.json({ success: true, appointment });
    } catch (err: any) {
      console.log("PATCH error:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/stats", async (_req, res) => {
    const stats = await storage.getStats();
    res.json(stats);
  });

  return httpServer;
}
