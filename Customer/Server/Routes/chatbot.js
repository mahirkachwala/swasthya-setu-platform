const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const VC = require('../models/VaccinationCenters');
const User = require('../models/User');

// Simple mock/proxy for AI chat
router.post('/chat', express.json(), async (req, res) => {
  const { message, aadhaar } = req.body;
  console.log(`Received message from ${aadhaar}: ${message}`);

  let response = "I'm sorry, I'm still learning. How can I help you today?";
  let intent = "general";

  const msg = message.toLowerCase();

  if (msg.includes("book") || msg.includes("appointment")) {
    response = "I can help you book an appointment. Would you like to see the nearest centers?";
    intent = "book_appointment";
  } else if (msg.includes("center") || msg.includes("near me")) {
    try {
      const centers = await VC.find({}).limit(1);
      if (centers.length > 0) {
        response = `The nearest center is ${centers[0].name}. You can reach there here: ${centers[0].url}`;
      } else {
        response = "I couldn't find any vaccination centers near you at the moment.";
      }
    } catch (err) {
      response = "I encountered an error while looking up centers.";
    }
    intent = "find_center";
  } else if (msg.includes("hi") || msg.includes("hello")) {
    response = "Namaste! I am ImmunoBot. I can help you with vaccination information and booking.";
    intent = "greet";
  } else if (msg.includes("upload") || msg.includes("document")) {
    response = "Please use the attachment button to upload your medical documents for verification.";
    intent = "Prepare_to_Upload";
  }

  res.json({ response, intent });
});

// Keep legacy webhook for compatibility if needed, but simplified
router.post('/', express.json(), (req, res) => {
  res.json({ fulfillmentText: "Please use the /chat endpoint for modern interaction." });
});

module.exports = router;