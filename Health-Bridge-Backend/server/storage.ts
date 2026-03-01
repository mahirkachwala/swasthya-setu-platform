import {
  type Appointment,
  type InsertAppointment,
  type AppointmentStatus,
} from "@shared/schema";
import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  name: String,
  phone: String,
  center: String,
  date: String,
  status: {
    type: String,
    default: "BOOKED",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const AppointmentModel = mongoose.model("Appointment", appointmentSchema);

export interface IStorage {
  createAppointment(data: InsertAppointment): Promise<Appointment>;
  getAllAppointments(): Promise<Appointment[]>;
  getAppointment(id: string): Promise<Appointment | undefined>;
  updateAppointmentStatus(
    id: string,
    status: AppointmentStatus,
  ): Promise<Appointment | undefined>;
  getStats(): Promise<{
    total: number;
    booked: number;
    confirmed: number;
    inProgress: number;
    completed: number;
    cancelled: number;
  }>;
}

function toAppointment(doc: any): Appointment {
  return {
    id: doc._id.toString(),
    name: doc.name,
    phone: doc.phone,
    center: doc.center,
    date: doc.date,
    status: doc.status,
    createdAt:
      doc.createdAt instanceof Date
        ? doc.createdAt.toISOString()
        : String(doc.createdAt),
  };
}

export class MongoStorage implements IStorage {
  async createAppointment(data: InsertAppointment): Promise<Appointment> {
    const doc = await AppointmentModel.create({
      name: data.name,
      phone: data.phone,
      center: data.center,
      date: data.date,
      status: "BOOKED",
    });
    const appointment = toAppointment(doc);
    console.log("Created appointment in MongoDB:", JSON.stringify(appointment));
    return appointment;
  }

  async getAllAppointments(): Promise<Appointment[]> {
    const docs = await AppointmentModel.find().sort({ createdAt: -1 });
    return docs.map(toAppointment);
  }

  async getAppointment(id: string): Promise<Appointment | undefined> {
    try {
      const doc = await AppointmentModel.findById(id);
      if (!doc) return undefined;
      return toAppointment(doc);
    } catch {
      return undefined;
    }
  }

  async updateAppointmentStatus(
    id: string,
    status: AppointmentStatus,
  ): Promise<Appointment | undefined> {
    try {
      const doc = await AppointmentModel.findByIdAndUpdate(
        id,
        { status },
        { new: true },
      );
      if (!doc) return undefined;
      return toAppointment(doc);
    } catch {
      return undefined;
    }
  }

  async getStats() {
    const all = await this.getAllAppointments();
    return {
      total: all.length,
      booked: all.filter((a) => a.status === "BOOKED").length,
      confirmed: all.filter((a) => a.status === "CONFIRMED").length,
      inProgress: all.filter((a) => a.status === "IN_PROGRESS").length,
      completed: all.filter((a) => a.status === "COMPLETED").length,
      cancelled: all.filter((a) => a.status === "CANCELLED").length,
    };
  }
}

export const storage = new MongoStorage();
