import {
  type User, type InsertUser,
  type Appointment, type InsertAppointment,
  type InventoryItem, type Shipment,
  type Alert, type Center, type DashboardStats,
  type CustomerUser, type Patient
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAppointments(centerId: string, date?: string): Promise<Appointment[]>;
  getAppointment(id: string): Promise<Appointment | undefined>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointmentStatus(id: string, status: string): Promise<Appointment | undefined>;
  getInventory(centerId: string): Promise<InventoryItem[]>;
  updateInventoryQuantity(id: string, quantity: number): Promise<InventoryItem | undefined>;
  getShipments(centerId: string): Promise<Shipment[]>;
  getShipment(shipmentId: string): Promise<Shipment | undefined>;
  createShipment(shipment: Omit<Shipment, "id">): Promise<Shipment>;
  updateShipment(shipmentId: string, updates: Partial<Shipment>): Promise<Shipment | undefined>;
  getCenter(centerId: string): Promise<Center | undefined>;
  getCenters(): Promise<Center[]>;
  getAlerts(centerId: string): Promise<Alert[]>;
  getDashboardStats(centerId: string): Promise<DashboardStats>;
  startSimulation(shipmentId: string): Promise<boolean>;
  registerCustomer(aadhaarId: string, name: string, phone: string, password: string): Promise<CustomerUser>;
  getCustomerByAadhaar(aadhaarId: string): Promise<CustomerUser | undefined>;
  getPatients(centerId: string): Promise<Patient[]>;
  getAppointmentsByAadhaar(aadhaarId: string): Promise<Appointment[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private appointments: Map<string, Appointment>;
  private inventory: Map<string, InventoryItem>;
  private shipments: Map<string, Shipment>;
  private centers: Map<string, Center>;
  private customers: Map<string, CustomerUser>;
  private simulationTimers: Map<string, ReturnType<typeof setInterval>>;

  constructor() {
    this.users = new Map();
    this.appointments = new Map();
    this.inventory = new Map();
    this.shipments = new Map();
    this.centers = new Map();
    this.customers = new Map();
    this.simulationTimers = new Map();
    this.seedData();
  }

  private seedData() {
    const centers: Center[] = [
      {
        centerId: "CEN-001",
        name: "PHC Andheri",
        lat: 19.1197,
        lng: 72.8464,
        address: "SV Road, Andheri West, Mumbai 400058",
        openSlots: 24,
        totalSlots: 40,
        vaccinesAvailable: { "Covishield": 120, "Covaxin": 15, "Sputnik V": 45 },
      },
      {
        centerId: "CEN-002",
        name: "PHC Bandra",
        lat: 19.0544,
        lng: 72.8406,
        address: "Hill Road, Bandra West, Mumbai 400050",
        openSlots: 18,
        totalSlots: 30,
        vaccinesAvailable: { "Covishield": 80, "Covaxin": 40 },
      },
      {
        centerId: "CEN-003",
        name: "CHC Dadar",
        lat: 19.0176,
        lng: 72.8562,
        address: "Tilak Bridge, Dadar East, Mumbai 400014",
        openSlots: 32,
        totalSlots: 50,
        vaccinesAvailable: { "Covishield": 150, "Covaxin": 60, "Sputnik V": 30 },
      },
      {
        centerId: "CEN-004",
        name: "UHC Kurla",
        lat: 19.0726,
        lng: 72.8845,
        address: "LBS Marg, Kurla West, Mumbai 400070",
        openSlots: 12,
        totalSlots: 25,
        vaccinesAvailable: { "Covishield": 50, "Covaxin": 25 },
      },
    ];
    for (const c of centers) {
      this.centers.set(c.centerId, c);
    }

    const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
    const appointments: Appointment[] = [
      {
        id: randomUUID(),
        appointmentId: "APT-000101",
        aadhaarId: "XXXX-XXXX-1234",
        patientName: "Ravi Patil",
        phone: "+919876543210",
        centerId: "CEN-001",
        centerName: "PHC Andheri",
        slotTime: `${today}T09:30:00+05:30`,
        vaccineType: "Covishield",
        dose: 1,
        aadhaarVerified: true,
        abhaStatus: "verified",
        status: "VACCINATED",
        source: "customer",
        createdAt: new Date().toISOString(),
      },
      {
        id: randomUUID(),
        appointmentId: "APT-000102",
        aadhaarId: "XXXX-XXXX-5678",
        patientName: "Priya Sharma",
        phone: "+919876543211",
        centerId: "CEN-001",
        centerName: "PHC Andheri",
        slotTime: `${today}T10:00:00+05:30`,
        vaccineType: "Covaxin",
        dose: 2,
        aadhaarVerified: true,
        abhaStatus: "verified",
        status: "CHECKED_IN",
        source: "customer",
        createdAt: new Date().toISOString(),
      },
      {
        id: randomUUID(),
        appointmentId: "APT-000103",
        aadhaarId: "XXXX-XXXX-9012",
        patientName: "Amit Kumar",
        phone: "+919876543212",
        centerId: "CEN-001",
        centerName: "PHC Andheri",
        slotTime: `${today}T10:30:00+05:30`,
        vaccineType: "Covishield",
        dose: 1,
        aadhaarVerified: false,
        abhaStatus: "pending",
        status: "BOOKED",
        source: "customer",
        createdAt: new Date().toISOString(),
      },
      {
        id: randomUUID(),
        appointmentId: "APT-000104",
        aadhaarId: "XXXX-XXXX-3456",
        patientName: "Sneha Deshmukh",
        phone: "+919876543213",
        centerId: "CEN-001",
        centerName: "PHC Andheri",
        slotTime: `${today}T11:00:00+05:30`,
        vaccineType: "Covishield",
        dose: 1,
        aadhaarVerified: true,
        abhaStatus: "not_registered",
        status: "BOOKED",
        source: "doctor",
        createdAt: new Date().toISOString(),
      },
      {
        id: randomUUID(),
        appointmentId: "APT-000105",
        aadhaarId: "XXXX-XXXX-7890",
        patientName: "Mahir Kachwala",
        phone: "+919876543214",
        centerId: "CEN-001",
        centerName: "PHC Andheri",
        slotTime: `${today}T11:30:00+05:30`,
        vaccineType: "Covaxin",
        dose: 1,
        aadhaarVerified: true,
        abhaStatus: "verified",
        status: "BOOKED",
        source: "customer",
        createdAt: new Date().toISOString(),
      },
      {
        id: randomUUID(),
        appointmentId: "APT-000106",
        aadhaarId: "XXXX-XXXX-4321",
        patientName: "Ananya Iyer",
        phone: "+919876543215",
        centerId: "CEN-001",
        centerName: "PHC Andheri",
        slotTime: `${today}T12:00:00+05:30`,
        vaccineType: "Sputnik V",
        dose: 1,
        aadhaarVerified: true,
        abhaStatus: "verified",
        status: "BOOKED",
        source: "customer",
        createdAt: new Date().toISOString(),
      },
      {
        id: randomUUID(),
        appointmentId: "APT-000107",
        aadhaarId: "XXXX-XXXX-8765",
        patientName: "Vikram Singh",
        phone: "+919876543216",
        centerId: "CEN-001",
        centerName: "PHC Andheri",
        slotTime: `${today}T12:30:00+05:30`,
        vaccineType: "Covishield",
        dose: 2,
        aadhaarVerified: true,
        abhaStatus: "pending",
        status: "BOOKED",
        source: "customer",
        createdAt: new Date().toISOString(),
      },
    ];

    for (const apt of appointments) {
      this.appointments.set(apt.id, apt);
    }

    const inventoryItems: InventoryItem[] = [
      {
        id: randomUUID(),
        centerId: "CEN-001",
        vaccineType: "Covishield",
        manufacturer: "Serum Institute",
        quantity: 120,
        batchNo: "BATCH-2026-007",
        expiryDate: "2026-12-31",
      },
      {
        id: randomUUID(),
        centerId: "CEN-001",
        vaccineType: "Covaxin",
        manufacturer: "Bharat Biotech",
        quantity: 15,
        batchNo: "BATCH-2026-008",
        expiryDate: "2026-10-15",
      },
      {
        id: randomUUID(),
        centerId: "CEN-001",
        vaccineType: "Sputnik V",
        manufacturer: "Dr. Reddy's",
        quantity: 45,
        batchNo: "BATCH-2026-010",
        expiryDate: "2026-08-20",
      },
    ];

    for (const item of inventoryItems) {
      this.inventory.set(item.id, item);
    }

    const shipments: Shipment[] = [
      {
        id: randomUUID(),
        shipmentId: "SHIP-00045",
        manufacturer: "Serum Institute",
        batchNo: "BATCH-2026-009",
        vaccineType: "Covishield",
        quantity: 500,
        originName: "Pune Plant",
        originLat: 18.5204,
        originLng: 73.8567,
        destinationCenterId: "CEN-001",
        destinationName: "PHC Andheri",
        status: "IN_TRANSIT",
        currentCheckpoint: "Hub A",
        currentLat: 18.90,
        currentLng: 73.10,
        checkpoints: [
          { name: "Pune Plant", lat: 18.5204, lng: 73.8567, etaSec: 0, reached: true, reachedAt: new Date(Date.now() - 120000).toISOString() },
          { name: "Hub A", lat: 18.90, lng: 73.10, etaSec: 10, reached: true, reachedAt: new Date(Date.now() - 60000).toISOString() },
          { name: "Hub B", lat: 19.05, lng: 72.90, etaSec: 20, reached: false },
          { name: "PHC Andheri", lat: 19.1197, lng: 72.8464, etaSec: 30, reached: false },
        ],
        lastUpdateTs: new Date().toISOString(),
      },
      {
        id: randomUUID(),
        shipmentId: "SHIP-00046",
        manufacturer: "Bharat Biotech",
        batchNo: "BATCH-2026-011",
        vaccineType: "Covaxin",
        quantity: 300,
        originName: "Hyderabad Plant",
        originLat: 17.3850,
        originLng: 78.4867,
        destinationCenterId: "CEN-001",
        destinationName: "PHC Andheri",
        status: "ARRIVED",
        currentCheckpoint: "PHC Andheri",
        currentLat: 19.1197,
        currentLng: 72.8464,
        checkpoints: [
          { name: "Hyderabad Plant", lat: 17.3850, lng: 78.4867, etaSec: 0, reached: true, reachedAt: new Date(Date.now() - 300000).toISOString() },
          { name: "Solapur Hub", lat: 17.6599, lng: 75.9064, etaSec: 10, reached: true, reachedAt: new Date(Date.now() - 200000).toISOString() },
          { name: "Pune Hub", lat: 18.5204, lng: 73.8567, etaSec: 20, reached: true, reachedAt: new Date(Date.now() - 100000).toISOString() },
          { name: "PHC Andheri", lat: 19.1197, lng: 72.8464, etaSec: 30, reached: true, reachedAt: new Date().toISOString() },
        ],
        lastUpdateTs: new Date().toISOString(),
      },
      {
        id: randomUUID(),
        shipmentId: "SHIP-00047",
        manufacturer: "Serum Institute",
        batchNo: "BATCH-2026-012",
        vaccineType: "Covishield",
        quantity: 200,
        originName: "Pune Plant",
        originLat: 18.5204,
        originLng: 73.8567,
        destinationCenterId: "CEN-001",
        destinationName: "PHC Andheri",
        status: "CREATED",
        currentCheckpoint: "Pune Plant",
        currentLat: 18.5204,
        currentLng: 73.8567,
        checkpoints: [
          { name: "Pune Plant", lat: 18.5204, lng: 73.8567, etaSec: 0, reached: false },
          { name: "Hub A", lat: 18.90, lng: 73.10, etaSec: 10, reached: false },
          { name: "Hub B", lat: 19.05, lng: 72.90, etaSec: 20, reached: false },
          { name: "PHC Andheri", lat: 19.1197, lng: 72.8464, etaSec: 30, reached: false },
        ],
        lastUpdateTs: new Date().toISOString(),
      },
    ];

    for (const ship of shipments) {
      this.shipments.set(ship.id, ship);
    }

    this.customers.set("123456789012", {
      id: randomUUID(),
      aadhaarId: "123456789012",
      name: "Ravi Patil",
      phone: "+919876543210",
      password: "pass123",
      vaccinated: "NO",
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAppointments(centerId: string, date?: string): Promise<Appointment[]> {
    const all = Array.from(this.appointments.values()).filter(a => a.centerId === centerId);
    if (date) {
      return all.filter(a => a.slotTime.startsWith(date));
    }
    return all;
  }

  async getAppointment(id: string): Promise<Appointment | undefined> {
    return this.appointments.get(id);
  }

  async createAppointment(data: InsertAppointment): Promise<Appointment> {
    const id = randomUUID();
    const appointment: Appointment = { ...data, id, createdAt: new Date().toISOString() };
    this.appointments.set(id, appointment);
    return appointment;
  }

  async updateAppointmentStatus(id: string, status: string): Promise<Appointment | undefined> {
    const apt = this.appointments.get(id);
    if (!apt) return undefined;
    const updated = { ...apt, status: status as Appointment["status"] };
    this.appointments.set(id, updated);
    return updated;
  }

  async getInventory(centerId: string): Promise<InventoryItem[]> {
    return Array.from(this.inventory.values()).filter(i => i.centerId === centerId);
  }

  async updateInventoryQuantity(id: string, quantity: number): Promise<InventoryItem | undefined> {
    const item = this.inventory.get(id);
    if (!item) return undefined;
    const updated = { ...item, quantity };
    this.inventory.set(id, updated);
    return updated;
  }

  async getShipments(centerId: string): Promise<Shipment[]> {
    return Array.from(this.shipments.values()).filter(s => s.destinationCenterId === centerId);
  }

  async getShipment(shipmentId: string): Promise<Shipment | undefined> {
    return Array.from(this.shipments.values()).find(s => s.shipmentId === shipmentId);
  }

  async createShipment(data: Omit<Shipment, "id">): Promise<Shipment> {
    const id = randomUUID();
    const shipment: Shipment = { ...data, id };
    this.shipments.set(id, shipment);
    return shipment;
  }

  async updateShipment(shipmentId: string, updates: Partial<Shipment>): Promise<Shipment | undefined> {
    const ship = Array.from(this.shipments.values()).find(s => s.shipmentId === shipmentId);
    if (!ship) return undefined;
    const updated = { ...ship, ...updates };
    this.shipments.set(ship.id, updated);
    return updated;
  }

  async getCenter(centerId: string): Promise<Center | undefined> {
    return this.centers.get(centerId);
  }

  async getCenters(): Promise<Center[]> {
    return Array.from(this.centers.values());
  }

  async getAlerts(centerId: string): Promise<Alert[]> {
    const alerts: Alert[] = [];
    const inventory = await this.getInventory(centerId);
    const shipments = await this.getShipments(centerId);
    const appointments = await this.getAppointments(centerId, new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date()));
    const center = await this.getCenter(centerId);

    for (const item of inventory) {
      if (item.quantity < 20) {
        alerts.push({
          id: randomUUID(),
          type: "low_stock",
          message: `Low Stock: ${item.vaccineType} - Only ${item.quantity} doses remaining`,
          severity: "red",
          timestamp: new Date().toISOString(),
        });
      }
    }

    for (const ship of shipments) {
      if (ship.status === "IN_TRANSIT") {
        alerts.push({
          id: randomUUID(),
          type: "in_transit",
          message: `Shipment ${ship.shipmentId} (${ship.vaccineType} x${ship.quantity}) in transit - At ${ship.currentCheckpoint}`,
          severity: "yellow",
          timestamp: ship.lastUpdateTs,
        });
      }
      if (ship.status === "ARRIVED") {
        alerts.push({
          id: randomUUID(),
          type: "arrived",
          message: `Shipment ${ship.shipmentId} (${ship.vaccineType} x${ship.quantity}) has arrived at ${ship.destinationName}`,
          severity: "green",
          timestamp: ship.lastUpdateTs,
        });
      }
    }

    if (center) {
      const capacityUsed = Math.round((appointments.length / center.totalSlots) * 100);
      if (capacityUsed >= 70) {
        alerts.push({
          id: randomUUID(),
          type: "capacity",
          message: `Today's Capacity Used: ${capacityUsed}% (${appointments.length}/${center.totalSlots} slots)`,
          severity: "blue",
          timestamp: new Date().toISOString(),
        });
      }
    }

    return alerts;
  }

  async getDashboardStats(centerId: string): Promise<DashboardStats> {
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
    const appointments = await this.getAppointments(centerId, today);
    const inventory = await this.getInventory(centerId);
    const shipments = await this.getShipments(centerId);
    const alerts = await this.getAlerts(centerId);
    const center = await this.getCenter(centerId);

    const totalStock = inventory.reduce((sum, i) => sum + i.quantity, 0);
    const incomingShipments = shipments.filter(s => s.status === "CREATED" || s.status === "IN_TRANSIT").length;

    const defaultCenter = {
      centerId,
      name: "Unknown Center",
      lat: 0, lng: 0,
      address: "",
      openSlots: 0,
      totalSlots: 40,
      vaccinesAvailable: {},
    };

    return {
      todayAppointments: appointments.length,
      checkedInPatients: appointments.filter(a => a.status === "CHECKED_IN").length,
      vaccinatedCount: appointments.filter(a => a.status === "VACCINATED").length,
      cancelledCount: appointments.filter(a => a.status === "CANCELLED").length,
      totalStock,
      incomingShipments,
      capacityUsed: center ? Math.round((appointments.length / center.totalSlots) * 100) : 0,
      totalSlots: center?.totalSlots || 40,
      alerts,
      center: center || defaultCenter,
    };
  }

  async startSimulation(shipmentId: string): Promise<boolean> {
    const ship = await this.getShipment(shipmentId);
    if (!ship) return false;
    if (this.simulationTimers.has(shipmentId)) return true;

    let checkpointIndex = ship.checkpoints.findIndex(c => !c.reached);
    if (checkpointIndex === -1) return false;

    await this.updateShipment(shipmentId, { status: "IN_TRANSIT" });

    const timer = setInterval(async () => {
      const current = await this.getShipment(shipmentId);
      if (!current) { clearInterval(timer); return; }

      const nextIdx = current.checkpoints.findIndex(c => !c.reached);
      if (nextIdx === -1) {
        clearInterval(timer);
        this.simulationTimers.delete(shipmentId);
        return;
      }

      const cp = current.checkpoints[nextIdx];
      const updatedCheckpoints = current.checkpoints.map((c, i) =>
        i === nextIdx ? { ...c, reached: true, reachedAt: new Date().toISOString() } : c
      );

      const isLast = nextIdx === current.checkpoints.length - 1;
      await this.updateShipment(shipmentId, {
        currentCheckpoint: cp.name,
        currentLat: cp.lat,
        currentLng: cp.lng,
        checkpoints: updatedCheckpoints,
        status: isLast ? "ARRIVED" : "IN_TRANSIT",
        lastUpdateTs: new Date().toISOString(),
      });

      if (isLast) {
        clearInterval(timer);
        this.simulationTimers.delete(shipmentId);
      }
    }, 3000);

    this.simulationTimers.set(shipmentId, timer);
    return true;
  }

  async registerCustomer(aadhaarId: string, name: string, phone: string, password: string): Promise<CustomerUser> {
    const id = randomUUID();
    const customer: CustomerUser = { id, aadhaarId, name, phone, password, vaccinated: "NO" };
    this.customers.set(aadhaarId, customer);
    return customer;
  }

  async getCustomerByAadhaar(aadhaarId: string): Promise<CustomerUser | undefined> {
    return this.customers.get(aadhaarId);
  }

  async getPatients(centerId: string): Promise<Patient[]> {
    const allAppointments = Array.from(this.appointments.values()).filter(a => a.centerId === centerId);
    const patientMap = new Map<string, Patient>();

    for (const apt of allAppointments) {
      const existing = patientMap.get(apt.aadhaarId);
      if (existing) {
        existing.totalVisits += 1;
        if (!existing.vaccinesTaken.includes(apt.vaccineType)) {
          existing.vaccinesTaken.push(apt.vaccineType);
        }
        if (!existing.lastVisit || apt.slotTime > existing.lastVisit) {
          existing.lastVisit = apt.slotTime;
        }
      } else {
        patientMap.set(apt.aadhaarId, {
          aadhaarId: apt.aadhaarId,
          name: apt.patientName,
          phone: apt.phone,
          aadhaarVerified: apt.aadhaarVerified,
          abhaStatus: apt.abhaStatus,
          totalVisits: 1,
          lastVisit: apt.slotTime,
          vaccinesTaken: [apt.vaccineType],
        });
      }
    }

    return Array.from(patientMap.values());
  }

  async getAppointmentsByAadhaar(aadhaarId: string): Promise<Appointment[]> {
    const masked = `XXXX-XXXX-${aadhaarId.slice(-4)}`;
    return Array.from(this.appointments.values()).filter(
      a => a.aadhaarId === masked && a.source === "customer"
    );
  }
}

export const storage = new MemStorage();
