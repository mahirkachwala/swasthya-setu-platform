const express = require('express');
const mongoose = require('mongoose');
const df = require('dialogflow-fulfillment');

const router = express.Router();
const VC = require('../models/VaccinationCenters');
const User =require('../models/User');
var bodyParser = require('body-parser');
const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/coldchain';
  await mongoose.connect(uri, { useUnifiedTopology: true, useNewUrlParser: true });
  console.log("Connected....");
}



router.post('/', express.json(), (req, res) => {
  const agent = new df.WebhookClient({
    request: req,
    response: res
  });


  async function findCenter(agent) {
    console.log("Finding nearby Centers");
    var url="";
    var name="";
    var mindist=100000000;
    // console.log("Finding Center");
    var location = agent.context.get("location");
    var lat=location.parameters.latitude;
    var long= location.parameters.longitude;
    var hospitals = await VC.find({});
      for (var i = 0; i < hospitals.length; i++) {
        var dist = Math.sqrt(Math.pow(hospitals[i].longitude - long, 2) + Math.pow(hospitals[i].latitude - lat, 2));
        if (dist < mindist) { mindist = dist; url = hospitals[i].url; name = hospitals[i].name; }
      }
      if (name != undefined) {
    console.log("Nearest center is " + name);
    agent.add("Nearest center is:  " + name + "\nYou will find the directions here:- " + url);
      } else {
    agent.add("Unable to locate you. Please make sure you have given me location permission.");
      }
  }

  function getLocationData(agent) {
    console.log("Locating User");
    // console.log(agent.parameters.longitude);
    agent.context.set("location", 10, { 'latitude': agent.parameters.latitude, 'longitude': agent.parameters.longitude });
    agent.add("Your Location is detected");

  }

  function getCurrentAadhaar(agent) {
    try {
      const ctx = agent.context.get("aadhaar");
      if (ctx && ctx.parameters && ctx.parameters.aadhaar) return ctx.parameters.aadhaar;
    } catch (e) {}
    console.warn("Aadhaar not in context; using session fallback. Ensure getAadhaar intent receives Aadhaar from app.");
    return null;
  }

  function registerAppointment(agent) {
    console.log("Initiating Appointment sequence");
    const aadharNo = getCurrentAadhaar(agent);
    var a = agent.context.get("aadhaar") && agent.context.get("aadhaar").parameters.medical_conditions;
    const updateFilter = aadharNo ? { aadhar_no: aadharNo } : { aadhar_no: "987654321" };
    User.updateOne(updateFilter, {$set:{"medical_conditions": a || []}})
      .then(user=>{
        // console.log("user",user);
        // console.log("Updated");
      }).catch(err=>(console.log(err)));
    agent.add("Understood,\nYou will be listed under following categories: \n"+ a.toString()+"\n\nPlease use the Attach Button to Upload Documents that indicate your medical condition. These Documents are necessary for Verification as your request will be prioritised. \n\nYou may upload multiple documents.");
    agent.add("Prepare_to_Upload");
  }
  function getAadhaar(agent) {
    console.log("Acquiring Aadhaar details");
    const aadhaar = (agent.parameters && agent.parameters.aadhaar)
      || (typeof agent.query === "string" && agent.query.replace(/\D/g, "").slice(0, 12))
      || null;
    if (aadhaar) agent.context.set("aadhaar", 10, { aadhaar: String(aadhaar) });
    agent.add("");
  }

  async function getDocuments(agent)
  {
    console.log("Fetching User Documents");

    var str="";
    console.log(agent.parameters);
    console.log(agent.parameters.number);
    if (agent.parameters.number== 0)
    {
      console.log("Printed")
      

      var url="";
      var name="";
      var mindist=100000000;
      // console.log("Finding Center");
      var location = agent.context.get("location");
      console.log(agent.context);
      var lat=location.parameters.latitude;
      var long= location.parameters.longitude;
      var hospitals = await VC.find({});
        for(var i=0;i<hospitals.length;i++){
          dist=Math.sqrt(Math.pow(hospitals[i].longitude-long,2)+Math.pow(hospitals[i].latitude-lat,2));
          // console.log("distance",dist);
          if(dist<mindist){url=hospitals[i].url; name=hospitals[i].name;
          console.log(name);}
        }
        if (name != undefined){      console.log("Nearest center is "+name);
      // console.log("Hospitals:"+ hospitals);
      str="Nearest center is:  "+name +"\nYou will find the directions here:- "+ url;
      }
      else
      {
        str="Unable to locate you. Please make sure you have given me location permission.";
      }
      agent.add("Okay I have Received your documents. These documents will be available to the Vaccinator for faster Verification.\n\n"+ str);
    }
    const aadharNo = getCurrentAadhaar(agent) || "987654321";
    User.updateOne({ aadhar_no: aadharNo }, {$addToSet:{"documents_url": agent.parameters.url || ""}})
      .then(user=>{
        console.log("user",user);
        console.log("Updated");
      }).catch(err=>(console.log(err)));


  }
  

  var intentMap = new Map();
  intentMap.set("GetLocation Data", getLocationData);
  intentMap.set("Vaccination Centers",findCenter);
  intentMap.set("Book Appointment - yes - Medical Enquiry",registerAppointment);
  intentMap.set("getAadhaar",getAadhaar);
  intentMap.set("getDocuments",getDocuments);

  agent.handleRequest(intentMap);



});

module.exports = router;