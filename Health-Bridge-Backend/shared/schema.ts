import { z } from "zod";

export const appointmentStatuses = [
  "BOOKED",
  "CONFIRMED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
] as const;

export type AppointmentStatus = (typeof appointmentStatuses)[number];

export interface Appointment {
  id: string;
  name: string;
  phone: string;
  center: string;
  date: string;
  status: AppointmentStatus;
  createdAt: string;
}

export const insertAppointmentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone is required"),
  center: z.string().min(1, "Center is required"),
  date: z.string().min(1, "Date is required"),
});

export const updateAppointmentSchema = z.object({
  status: z.enum(appointmentStatuses),
});

export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type UpdateAppointment = z.infer<typeof updateAppointmentSchema>;
