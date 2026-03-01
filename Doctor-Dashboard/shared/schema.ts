import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const appointmentSchema = z.object({
  id: z.string(),
  appointmentId: z.string(),
  aadhaarId: z.string(),
  patientName: z.string(),
  phone: z.string(),
  centerId: z.string(),
  centerName: z.string(),
  slotTime: z.string(),
  vaccineType: z.string(),
  dose: z.number().optional(),
  aadhaarVerified: z.boolean(),
  abhaStatus: z.enum(["verified", "pending", "not_registered"]),
  status: z.enum(["BOOKED", "CHECKED_IN", "VACCINATED", "CANCELLED", "DISPOSED"]),
  source: z.enum(["doctor", "customer"]).optional(),
  createdAt: z.string(),
});

export type Appointment = z.infer<typeof appointmentSchema>;

export const insertAppointmentSchema = appointmentSchema.omit({ id: true, createdAt: true });
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;

export const inventoryItemSchema = z.object({
  id: z.string(),
  centerId: z.string(),
  vaccineType: z.string(),
  manufacturer: z.string(),
  quantity: z.number(),
  batchNo: z.string(),
  expiryDate: z.string(),
});

export type InventoryItem = z.infer<typeof inventoryItemSchema>;

export const checkpointSchema = z.object({
  name: z.string(),
  lat: z.number(),
  lng: z.number(),
  etaSec: z.number(),
  reached: z.boolean().optional(),
  reachedAt: z.string().optional(),
});

export type Checkpoint = z.infer<typeof checkpointSchema>;

export const shipmentSchema = z.object({
  id: z.string(),
  shipmentId: z.string(),
  manufacturer: z.string(),
  batchNo: z.string(),
  vaccineType: z.string(),
  quantity: z.number(),
  originName: z.string(),
  originLat: z.number(),
  originLng: z.number(),
  destinationCenterId: z.string(),
  destinationName: z.string(),
  status: z.enum(["CREATED", "IN_TRANSIT", "ARRIVED"]),
  currentCheckpoint: z.string(),
  currentLat: z.number(),
  currentLng: z.number(),
  checkpoints: z.array(checkpointSchema),
  lastUpdateTs: z.string(),
});

export type Shipment = z.infer<typeof shipmentSchema>;

export const alertSchema = z.object({
  id: z.string(),
  type: z.enum(["low_stock", "in_transit", "arrived", "capacity"]),
  message: z.string(),
  severity: z.enum(["red", "yellow", "green", "blue"]),
  timestamp: z.string(),
});

export type Alert = z.infer<typeof alertSchema>;

export const centerSchema = z.object({
  centerId: z.string(),
  name: z.string(),
  lat: z.number(),
  lng: z.number(),
  address: z.string(),
  openSlots: z.number(),
  totalSlots: z.number(),
  vaccinesAvailable: z.record(z.number()),
});

export type Center = z.infer<typeof centerSchema>;

export const qrScanSchema = z.object({
  qrPayload: z.string(),
});

export const reorderSchema = z.object({
  centerId: z.string(),
  manufacturer: z.string(),
  vaccineType: z.string(),
  quantity: z.number(),
});

export const customerUserSchema = z.object({
  id: z.string(),
  aadhaarId: z.string(),
  name: z.string(),
  phone: z.string().optional(),
  password: z.string(),
  vaccinated: z.enum(["YES", "NO"]),
});

export type CustomerUser = z.infer<typeof customerUserSchema>;

export const patientSchema = z.object({
  aadhaarId: z.string(),
  name: z.string(),
  phone: z.string(),
  aadhaarVerified: z.boolean(),
  abhaStatus: z.string(),
  totalVisits: z.number(),
  lastVisit: z.string().optional(),
  vaccinesTaken: z.array(z.string()),
});

export type Patient = z.infer<typeof patientSchema>;

export interface DashboardStats {
  todayAppointments: number;
  checkedInPatients: number;
  vaccinatedCount: number;
  cancelledCount: number;
  totalStock: number;
  incomingShipments: number;
  capacityUsed: number;
  totalSlots: number;
  alerts: Alert[];
  center: Center;
}
