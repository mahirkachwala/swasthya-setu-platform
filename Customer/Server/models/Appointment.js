const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  appointmentId: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  centerId: { type: String, required: true },
  centerName: { type: String },
  slot: { type: Date, required: true },
  dose: { type: Number, default: 1 },
  status: { type: String, enum: ['BOOKED', 'COMPLETED', 'CANCELLED'], default: 'BOOKED' },
  aadhaarHash: { type: String, default: null },
  appointmentHash: { type: String, default: null },
  txHash: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
}, { collection: 'Appointments' });

module.exports = mongoose.model('Appointment', appointmentSchema);
