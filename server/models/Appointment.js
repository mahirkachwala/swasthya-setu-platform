const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  aadhaarHash: { type: String },
  aadhaarMasked: { type: String },
  centerId: { type: String, required: true },
  centerName: { type: String },
  lat: { type: Number },
  lng: { type: Number },
  slot: { type: String },
  dose: { type: Number, default: 1 },
  language: { type: String },
  status: { type: String, enum: ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'], default: 'PENDING' },
  eventHash: { type: String },
  txHash: { type: String },
  createdAt: { type: Date, default: Date.now },
}, { collection: 'Appointment', timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
