require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const http = require("http");
const path = require("path");

const { Server } = require("socket.io");

const Sentiment = require("sentiment");
const stringSimilarity = require("string-similarity");

const { GoogleGenerativeAI } = require("@google/generative-ai");

const User = require("./models/User");
const Complaint = require("./models/Complaint");
const Alert = require("./models/Alert");

const auth = require("./middleware/auth");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

/* =========================================
   MIDDLEWARE
========================================= */

app.use(cors());
// Increase payload limit to seamlessly accommodate larger Base64 image strings
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb", extended: true }));
app.use(express.static(path.join(__dirname, "public")));

/* =========================================
   MONGODB CONNECTION
========================================= */

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected Successfully");
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
  });


app.get('/api/config', (req, res) => {
    res.json({
        googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY
    });
});

/* =========================================
   GEMINI AI SETUP
========================================= */

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy_key");

/* =========================================
   GEMINI FALLBACK MODELS (Vision Capable)
========================================= */

const fallbackModels = [
  "gemini-2.5-flash",
  "gemini-2.5-pro",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-1.5-pro"
];

/* =========================================
   GENERATE AI CONTENT RESPONSE (TEXT)
========================================= */

async function generateAIResponse(prompt) {
  for (const modelName of fallbackModels) {
    try {
      console.log(`Trying AI model: ${modelName}`);
      const model = genAI.getGenerativeModel({
        model: modelName,
      });

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      console.log(`✅ Success with AI model: ${modelName}`);
      return text;
    } catch (error) {
      console.warn(`⚠️ Failed model ${modelName}: ${error.message}`);
    }
  }
  throw new Error("All Gemini AI models failed or API key is invalid.");
}

/* =========================================
   AI UTILITIES
========================================= */

const sentiment = new Sentiment();

/* =========================================
   AUTO DEPARTMENT ROUTING
========================================= */

function detectDepartment(issue) {
  issue = issue.toLowerCase();

  if (issue.includes("garbage") || issue.includes("trash") || issue.includes("waste")) {
    return "Sanitation";
  }
  if (issue.includes("water") || issue.includes("pipeline") || issue.includes("drain")) {
    return "Water Department";
  }
  if (issue.includes("road") || issue.includes("pothole")) {
    return "Road Maintenance";
  }
  if (issue.includes("electricity") || issue.includes("street light") || issue.includes("power")) {
    return "Electricity";
  }
  if (issue.includes("hospital") || issue.includes("medical")) {
    return "Health Department";
  }
  return "General Administration";
}

/* =========================================
   AI RISK SCORING
========================================= */

function calculateRisk(issue, score) {
  let risk = 20;

  if (score < 0) {
    risk += 30;
  }
  if (issue.includes("hospital")) {
    risk += 50;
  }
  if (issue.includes("school")) {
    risk += 40;
  }
  if (issue.includes("urgent")) {
    risk += 30;
  }
  if (issue.includes("accident")) {
    risk += 50;
  }

  if (risk >= 80) {
    return "Critical";
  }
  if (risk >= 50) {
    return "High";
  }
  return "Medium";
}

/* =========================================
   AI CLUSTERING
========================================= */

function detectCluster(issue) {
  issue = issue.toLowerCase();

  if (issue.includes("garbage") || issue.includes("trash")) {
    return "Waste Cluster";
  }
  if (issue.includes("road") || issue.includes("pothole")) {
    return "Road Cluster";
  }
  if (issue.includes("water")) {
    return "Water Cluster";
  }
  if (issue.includes("electricity")) {
    return "Electricity Cluster";
  }
  return "General Cluster";
}

/* =========================================
   MOUNT AUTH ROUTES
========================================= */

const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

/* =========================================
   ROOT ENDPOINT
========================================= */

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname,"public", "index.html"));
});

/* =========================================
   GET ALL USERS (ADMIN ONLY)
========================================= */

app.get(
  "/api/users",
  auth(["admin"]),
  async (req, res) => {
    try {
      const users = await User.find({}, "-password").sort({ createdAt: -1 });
      res.json(users);
    } catch (error) {
      res.status(500).json({
        error: error.message
      });
    }
  }
);

/* =========================================
   NEW MULTIMODAL AI IMAGE ANALYSIS ENDPOINT
========================================= */

app.post(
  "/api/analyze-image",
  auth(["citizen", "admin"]),
  async (req, res) => {
    try {
      const { image } = req.body; // Expects raw Data URL string (e.g., "data:image/jpeg;base64,...")
      if (!image) {
        return res.status(400).json({ error: "Missing required Base64 image payload parameters." });
      }

      // Step 1: Securely determine citizen name via existing authenticated session context
      let citizenName = "Citizen";
      if (req.user && req.user.id) {
        const loggedInUser = await User.findById(req.user.id);
        if (loggedInUser) {
          citizenName = loggedInUser.name;
        }
      }

      // Step 2: Separate metadata headers from raw Base64 contents
      const matches = image.match(/^data:(image\/.+);base64,(.*)$/);
      if (!matches || matches.length < 3) {
        return res.status(400).json({ error: "Invalid image encoding structure string format." });
      }
      
      const mimeType = matches[1];
      const base64Data = matches[2];

      // Convert format structures to interface seamlessly with Google Generative AI components
      const imagePart = {
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        },
      };

      const prompt = `
        You are a Smart Civic Governance assistant scanning photographs uploaded by citizens.
        Analyze this image and provide a concise, clear problem statement describing the structural or administrative issue visible.
        Examples: "Broken pipeline leaking water", "Massive potholes on asphalt road", "Piles of uncollected garbage trash".
        Return only the final text description as your response without any punctuation or formatting blocks.
      `;

      let problemStatement = "Civic grievance reported";
      
      // Step 3: Iterate through vision fallbacks to extract context
      for (const modelName of fallbackModels) {
        try {
          console.log(`Trying Vision model: ${modelName}`);
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent([prompt, imagePart]);
          const text = result.response.text();
          
          if (text && text.trim().length > 0) {
            problemStatement = text.replace(/[\r\n`]/g, "").trim();
            console.log(`✅ Image processing succeeded using model: ${modelName}`);
            break;
          }
        } catch (visionError) {
          console.warn(`⚠️ Model ${modelName} failed visual parsing: ${visionError.message}`);
        }
      }

      // Step 4: Dispatch data back to form controller bindings
      res.json({
        citizenName,
        problemStatement
      });

    } catch (error) {
      console.error("AI Analyzer breakdown: ", error);
      res.status(500).json({ error: "Failed to parse visual components." });
    }
  }
);

/* =========================================
   CREATE COMPLAINT
========================================= */

app.post(
  "/api/complaints",
  auth(["citizen", "admin"]),
  async (req, res) => {
    try {
      const { citizen, issue, lat, lng } = req.body;

      /* =====================
         AI ROUTING
      ===================== */
      const department = detectDepartment(issue);

      /* =====================
         AI CLUSTERING
      ===================== */
      const cluster = detectCluster(issue);

      /* =====================
         SENTIMENT ANALYSIS
      ===================== */
      const sentimentResult = sentiment.analyze(issue);

      /* =====================
         DUPLICATE DETECTION & SYNCHRONIZATION
      ===================== */
      const existingComplaints = await Complaint.find();
      let duplicate = false;

      if (existingComplaints.length > 0) {
        const matches = existingComplaints.filter(c => {
          const rating = stringSimilarity.compareTwoStrings(
            issue.toLowerCase().trim(),
            c.issue.toLowerCase().trim()
          );
          return rating > 0.5;
        });

        if (matches.length > 0) {
          duplicate = true;
          const matchIds = matches.map(m => m._id);

          await Complaint.updateMany(
            { _id: { $in: matchIds } },
            { $set: { duplicate: true } }
          );
        }
      }

      /* =====================
         RISK SCORING
      ===================== */
      const risk = calculateRisk(issue.toLowerCase(), sentimentResult.score);

      /* =====================
         CREATE COMPLAINT
      ===================== */
      const complaint = new Complaint({
        citizen,
        issue,
        department,
        sentiment: sentimentResult.score,
        duplicate,
        risk,
        cluster,
        status: "Submitted",
        location: {
          lat: Number(lat),
          lng: Number(lng),
        },
        timeline: [
          {
            status: "Submitted",
            time: new Date().toLocaleString(),
          },
        ],
      });

      await complaint.save();

      /* =====================
         SOCKET LIVE UPDATE
      ===================== */
      io.emit("newComplaint", complaint);

      /* =====================
         LIVE CRITICAL ALERT
      ===================== */
      if (risk === "Critical") {
        const alert = new Alert({
          message: `🚨 Critical Complaint: ${issue}`,
          severity: "Critical",
        });

        await alert.save();
        io.emit("criticalAlert", alert);
      }

      res.json({
        success: true,
        message: "Complaint submitted successfully",
        complaint,
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
);

/* =========================================
   GET ALL COMPLAINTS
========================================= */

app.get(
  "/api/complaints",
  auth(["admin", "officer", "citizen"]),
  async (req, res) => {
    try {
      const complaints = await Complaint.find().sort({
        createdAt: -1,
      });
      res.json(complaints);
    } catch (error) {
      res.status(500).json({
        error: error.message,
      });
    }
  }
);

/* =========================================
   UPDATE COMPLAINT STATUS
========================================= */

app.put(
  "/api/complaints/:id",
  auth(["admin", "officer"]),
  async (req, res) => {
    try {
      const complaint = await Complaint.findById(req.params.id);

      if (!complaint) {
        return res.status(404).json({
          message: "Complaint not found",
        });
      }

      complaint.status = req.body.status;
      complaint.timeline.push({
        status: req.body.status,
        time: new Date().toLocaleString(),
      });

      await complaint.save();

      io.emit("statusUpdated", complaint);

      res.json({
        message: "Status updated successfully",
        complaint,
      });
    } catch (error) {
      res.status(500).json({
        error: error.message,
      });
    }
  }
);

/* =========================================
   ANALYTICS
========================================= */

app.get(
  "/api/analytics",
  auth(["admin", "officer"]),
  async (req, res) => {
    try {
      const total = await Complaint.countDocuments();
      const critical = await Complaint.countDocuments({ risk: "Critical" });
      const duplicates = await Complaint.countDocuments({ duplicate: true });
      const sanitation = await Complaint.countDocuments({ department: "Sanitation" });
      const road = await Complaint.countDocuments({ department: "Road Maintenance" });
      const water = await Complaint.countDocuments({ department: "Water Department" });

      res.json({
        total,
        critical,
        duplicates,
        sanitation,
        road,
        water,
      });
    } catch (error) {
      res.status(500).json({
        error: error.message,
      });
    }
  }
);

/* =========================================
   HEATMAP DATA
========================================= */

app.get(
  "/api/heatmap",
  auth(["admin", "officer"]),
  async (req, res) => {
    try {
      const complaints = await Complaint.find();
      const heatmap = complaints.map((c) => ({
        lat: c.location.lat,
        lng: c.location.lng,
        risk: c.risk,
      }));
      res.json(heatmap);
    } catch (error) {
      res.status(500).json({
        error: error.message,
      });
    }
  }
);

/* =========================================
   LIVE ALERTS HISTORY
========================================= */

app.get(
  "/api/alerts",
  auth(["admin", "officer"]),
  async (req, res) => {
    try {
      const alerts = await Alert.find().sort({
        createdAt: -1,
      });
      res.json(alerts);
    } catch (error) {
      res.status(500).json({
        error: error.message,
      });
    }
  }
);

/* =========================================
   GEMINI CHATBOT ASSISTANT
========================================= */

app.post(
  "/api/chat",
  async (req, res) => {
    try {
      const { message } = req.body;

      const prompt = `
You are an AI Smart Governance Assistant.

Your role:
- Help citizens understand civic administrative duties.
- Explain grievance procedures and status logs.
- Provide professional, polite and actionable answers regarding city maintenance.

User Question:
${message}
      `;

      const reply = await generateAIResponse(prompt);
      res.json({ reply });
    } catch (error) {
      res.status(500).json({
        reply: "Sorry, I am currently unable to process your request. Please try again later.",
        error: error.message,
      });
    }
  }
);

/* =========================================
   SOCKET.IO REAL-TIME HANDLER
========================================= */

io.on("connection", (socket) => {
  console.log("⚡ Real-time User Connected via Socket.io");

  socket.on("disconnect", () => {
    console.log("❌ Real-time User Disconnected");
  });
});

// -------------------------------------------------------------
// GET CITIZENS DIRECTORY ENDPOINT
// -------------------------------------------------------------
app.get('/api/citizens', async (req, res) => {
  try {
    const citizens = await User.find({ role: 'citizen' }).select('-password');
    res.status(200).json(citizens);
  } catch (err) {
    console.error("Backend error fetching citizens:", err);
    res.status(500).json({ error: "Failed to fetch citizen records" });
  }
});

// -------------------------------------------------------------
// GET OFFICERS DIRECTORY ENDPOINT
// -------------------------------------------------------------
app.get('/api/officers', async (req, res) => {
  try {
    const officers = await User.find({ role: 'officer' }).select('-password');
    res.status(200).json(officers);
  } catch (err) {
    console.error("Backend error fetching officers:", err);
    res.status(500).json({ error: "Failed to fetch officer personnel records" });
  }
});

/* =========================================
   START EXPRESS SERVER
========================================= */

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server fully operational on port ${PORT}`);
});