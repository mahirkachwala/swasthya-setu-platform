const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');
const Aadhar = require('../models/Aadhar');
const OTP = require('../models/OTP');
const Appointment = require('../models/Appointment');
const VC = require('../models/VaccinationCenters');
const { sha256 } = require('../services/auditChain');

const demoUsers = {};
const demoAppointments = {};

function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

const DEMO_CENTERS = [
  { _id: 'demo-1', name: 'City Hospital Vaccination Center', latitude: '19.0760', longitude: '72.8777', url: '#', address: 'Mumbai, Maharashtra', slots: 15 },
  { _id: 'demo-2', name: 'PHC Rural Health Center', latitude: '19.0820', longitude: '72.8850', url: '#', address: 'Thane, Maharashtra', slots: 8 },
  { _id: 'demo-3', name: 'District Government Hospital', latitude: '19.0900', longitude: '72.8900', url: '#', address: 'Navi Mumbai, Maharashtra', slots: 22 },
  { _id: 'demo-4', name: 'Community Health Center', latitude: '18.9700', longitude: '72.8200', url: '#', address: 'Pune, Maharashtra', slots: 12 }
];

router.post('/register', express.json(), async (req, res) => {
  try {
    const { aadhaar, name, phone, password } = req.body;
    if (!aadhaar || !name || !password) {
      return res.status(400).json({ error: 'aadhaar, name, and password are required' });
    }

    if (!isDbConnected()) {
      if (demoUsers[aadhaar]) return res.status(409).json({ error: 'User already registered' });
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);
      demoUsers[aadhaar] = { username: name, aadhar_no: aadhaar, password: hash, vaccinated: 'NO', score: 0 };
      demoAppointments[aadhaar] = [];
      return res.json({ success: true, user: { username: name, aadhar_no: aadhaar, vaccinated: 'NO' } });
    }

    const existing = await User.findOne({ aadhar_no: aadhaar });
    if (existing) return res.status(409).json({ error: 'User already registered' });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const user = new User({
      username: name,
      aadhar_no: aadhaar,
      password: hash,
      vaccinated: 'NO',
      score: 0,
      medical_conditions: []
    });
    await user.save();

    res.json({
      success: true,
      user: { username: user.username, aadhar_no: user.aadhar_no, vaccinated: user.vaccinated }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', express.json(), async (req, res) => {
  try {
    const { aadhaar, password } = req.body;
    if (!aadhaar || !password) {
      return res.status(400).json({ error: 'aadhaar and password required' });
    }

    if (!isDbConnected()) {
      const u = demoUsers[aadhaar];
      if (!u) return res.status(404).json({ error: 'User not found. Please register first.' });
      const match = await bcrypt.compare(password, u.password);
      if (!match) return res.status(401).json({ error: 'Incorrect password' });
      return res.json({
        success: true,
        user: { id: aadhaar, username: u.username, aadhar_no: u.aadhar_no, vaccinated: u.vaccinated, score: u.score }
      });
    }

    const user = await User.findOne({ aadhar_no: aadhaar });
    if (!user) return res.status(404).json({ error: 'User not found. Please register first.' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Incorrect password' });

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        aadhar_no: user.aadhar_no,
        vaccinated: user.vaccinated,
        score: user.score
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/centers', async (req, res) => {
  if (!isDbConnected()) return res.json(DEMO_CENTERS);
  try {
    const centers = await VC.find({});
    if (centers.length === 0) return res.json(DEMO_CENTERS);
    res.json(centers);
  } catch (err) {
    res.json(DEMO_CENTERS);
  }
});

router.post('/book', express.json(), async (req, res) => {
  try {
    const { aadhaar, centerId, centerName, slot, dose } = req.body;
    if (!aadhaar || !centerId || !slot) {
      return res.status(400).json({ error: 'aadhaar, centerId, and slot required' });
    }

    const appointmentId = 'APT-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    const aadhaarHash = sha256(aadhaar);
    const appointmentHash = sha256(JSON.stringify({ appointmentId, aadhaar: aadhaarHash, centerId, slot }));

    const aptData = {
      appointmentId,
      userId: aadhaar,
      centerId,
      centerName: centerName || centerId,
      slot: new Date(slot),
      dose: dose || 1,
      status: 'BOOKED',
      aadhaarHash,
      appointmentHash,
      createdAt: new Date()
    };

    if (!isDbConnected()) {
      if (!demoAppointments[aadhaar]) demoAppointments[aadhaar] = [];
      demoAppointments[aadhaar].unshift(aptData);
    } else {
      const appointment = new Appointment(aptData);
      await appointment.save();
    }

    res.json({
      success: true,
      appointment: {
        appointmentId,
        centerName: aptData.centerName,
        slot: aptData.slot,
        dose: aptData.dose,
        status: aptData.status,
        appointmentHash,
        qrData: JSON.stringify({
          appointmentId,
          centerName: aptData.centerName,
          slot: aptData.slot,
          dose: aptData.dose,
          verified: true,
          hash: appointmentHash.substring(0, 16)
        })
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/appointments/:aadhaar', async (req, res) => {
  if (!isDbConnected()) {
    return res.json(demoAppointments[req.params.aadhaar] || []);
  }
  try {
    const appointments = await Appointment.find({ userId: req.params.aadhaar }).sort({ createdAt: -1 });
    res.json(appointments);
  } catch (err) {
    res.json([]);
  }
});

router.post('/cancel', express.json(), async (req, res) => {
  try {
    const { appointmentId, aadhaar } = req.body;

    if (!isDbConnected()) {
      const list = demoAppointments[aadhaar] || [];
      const apt = list.find(a => a.appointmentId === appointmentId);
      if (!apt) return res.status(404).json({ error: 'Appointment not found' });
      apt.status = 'CANCELLED';
      return res.json({ success: true, status: 'CANCELLED' });
    }

    const apt = await Appointment.findOne({ appointmentId });
    if (!apt) return res.status(404).json({ error: 'Appointment not found' });
    apt.status = 'CANCELLED';
    await apt.save();
    res.json({ success: true, status: 'CANCELLED' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/profile/:aadhaar', async (req, res) => {
  if (!isDbConnected()) {
    const u = demoUsers[req.params.aadhaar];
    if (!u) return res.status(404).json({ error: 'User not found' });
    return res.json({
      user: { username: u.username, aadhar_no: u.aadhar_no, vaccinated: u.vaccinated, score: u.score, medical_conditions: [] },
      appointments: demoAppointments[req.params.aadhaar] || []
    });
  }
  try {
    const user = await User.findOne({ aadhar_no: req.params.aadhaar });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const appointments = await Appointment.find({ userId: req.params.aadhaar }).sort({ createdAt: -1 });
    res.json({
      user: {
        username: user.username,
        aadhar_no: user.aadhar_no,
        vaccinated: user.vaccinated,
        score: user.score,
        medical_conditions: user.medical_conditions
      },
      appointments
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
