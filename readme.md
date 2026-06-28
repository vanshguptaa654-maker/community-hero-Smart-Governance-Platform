# 🚀 Smart Governance Platform

> **AI-Powered Community Hero – Hyperlocal Problem Solver**

An intelligent civic grievance management platform that enables citizens to report, track, and resolve community issues through Artificial Intelligence, real-time communication, and location-based services.

Developed as a solution for the **Community Hero – Hyperlocal Problem Solver** challenge, the platform improves transparency, accountability, and citizen participation in public grievance resolution.

---

## 📌 Problem Statement

Communities frequently face civic issues such as potholes, water leakages, damaged streetlights, overflowing garbage, drainage problems, and other public infrastructure challenges.

Traditional complaint systems are often fragmented, slow, difficult to track, and lack transparency.

The Smart Governance Platform addresses these challenges by providing an AI-powered solution that enables citizens to report issues, automatically categorizes complaints, detects duplicate reports, prioritizes urgent cases, and allows real-time tracking until resolution.

---

# ✨ Features

## 👤 Citizen Portal

- User Registration & Login
- Secure JWT Authentication
- Submit Complaints
- AI Image-Based Complaint Analysis
- Automatic Issue Description Generation
- Live Complaint Status Tracking
- Complaint Timeline
- AI Chat Assistant

---

## 👮 Officer Portal

- Secure Officer Login
- View Assigned Complaints
- Update Complaint Status
- Monitor Critical Issues
- Access Analytics Dashboard
- Real-Time Notifications

---

## 👨‍💼 Administrator Portal

- Manage Citizens
- Manage Officers
- View All Complaints
- Complaint Analytics
- Live Alert Dashboard
- Heatmap Visualization
- System Monitoring

---

# 🤖 AI Features

- AI Image Analysis using Google Gemini
- Automatic Department Detection
- Smart Complaint Categorization
- Sentiment Analysis
- Duplicate Complaint Detection
- Risk Assessment
- AI Chat Assistant
- Intelligent Complaint Routing

---

# 📍 Smart Features

- Image Upload Support
- Geo-Location Based Complaints
- Real-Time Updates using Socket.IO
- Complaint Timeline Tracking
- Live Critical Alerts
- Interactive Dashboards
- Heatmap Analysis

---

# 🛠️ Tech Stack

## Frontend

- HTML5
- CSS3
- JavaScript

## Backend

- Node.js
- Express.js

## Database

- MongoDB
- Mongoose

## Authentication

- JWT
- Bcrypt.js

## Artificial Intelligence

- Google Gemini AI
- Sentiment Analysis
- String Similarity

## Real-Time Communication

- Socket.IO

## Maps

- Google Maps API

---

# 📂 Project Structure

```
Smart-Governance-Platform/
│
├── middleware/
│   └── auth.js
│
├── models/
│   ├── User.js
│   ├── Complaint.js
│   └── Alert.js
│
├── public/
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── citizen.html
│   ├── officer.html
│   ├── admin.html
│   ├── app.js
│   └── style.css
│
├── routes/
│   └── auth.js
│
├── server.js
├── package.json
└── README.md
```

---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/yourusername/Smart-Governance-Platform.git
```

```bash
cd Smart-Governance-Platform
```

---

## Install Dependencies

```bash
npm install
```

---

## Create Environment File

Create a `.env` file in the project root.

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key

GEMINI_API_KEY=your_gemini_api_key

GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

---

## Start Server

```bash
npm start
```

or

```bash
npm run dev
```

---

# 🌐 Application Workflow

1. Citizen registers and logs in.
2. Citizen submits a complaint with image and location.
3. Google Gemini AI analyzes the uploaded image.
4. AI generates the complaint description.
5. System detects the appropriate department.
6. Duplicate complaints are identified.
7. Complaint risk level is calculated.
8. Complaint is stored in MongoDB.
9. Officers receive the complaint instantly.
10. Complaint status is updated in real time.
11. Citizens track progress until resolution.

---

# 📊 Key Functionalities

✅ Secure Authentication

✅ AI Image Recognition

✅ AI Chat Assistant

✅ Smart Department Routing

✅ Duplicate Complaint Detection

✅ Sentiment Analysis

✅ Risk Assessment

✅ Complaint Timeline

✅ Real-Time Notifications

✅ Interactive Dashboard

✅ Heatmap Visualization

---

# 🔐 Security Features

- JWT Authentication
- Password Hashing using Bcrypt
- Role-Based Access Control
- Protected API Endpoints
- Secure Database Storage

---

# 🌍 Google Technologies Used

- Google Gemini AI
- Google Maps Platform

---

# 🎯 Future Enhancements

- Mobile Application
- Push Notifications
- Multi-language Support
- Voice-Based Complaint Submission
- Predictive Analytics
- IoT Device Integration
- Citizen Reward System
- AI Recommendation Engine

---

# 👨‍💻 Developed By

**Vansh Gupta**

---

# 📜 License

This project is licensed under the **ISC License**.

---

# ⭐ Support

If you found this project helpful, please consider giving it a ⭐ on GitHub.
