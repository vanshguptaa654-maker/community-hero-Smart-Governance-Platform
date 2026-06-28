const mongoose = require("mongoose");

/* =========================================
   TIMELINE SCHEMA
========================================= */

const timelineSchema =
  new mongoose.Schema({

    status: {
      type: String,
      required: true,
    },

    updatedBy: {
      type: String,
      default: "System",
    },

    note: {
      type: String,
      default: "",
    },

    time: {
      type: String,
      default:
        () =>
          new Date().toLocaleString(),
    },

  });

/* =========================================
   COMPLAINT SCHEMA
========================================= */

const complaintSchema =
  new mongoose.Schema({

    /* =====================
       CITIZEN INFO
    ===================== */

    citizen: {
      type: String,
      required: true,
      trim: true,
    },

    citizenId: {
      type:
        mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    /* =====================
       ISSUE DETAILS
    ===================== */

    issue: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    image: {
      type: String,
      default: "",
    },

    /* =====================
       AI FEATURES
    ===================== */

    department: {
      type: String,
      default:
        "General Administration",
    },

    cluster: {
      type: String,
      default:
        "General Cluster",
    },

    sentiment: {
      type: Number,
      default: 0,
    },

    duplicate: {
      type: Boolean,
      default: false,
    },

    duplicateScore: {
      type: Number,
      default: 0,
    },

    risk: {
      type: String,

      enum: [
        "Low",
        "Medium",
        "High",
        "Critical",
      ],

      default: "Medium",
    },

    aiSummary: {
      type: String,
      default: "",
    },

    /* =====================
       LOCATION
    ===================== */

    location: {

      lat: {
        type: Number,
        required: true,
      },

      lng: {
        type: Number,
        required: true,
      },

      address: {
        type: String,
        default: "",
      },

      ward: {
        type: String,
        default: "",
      },

    },

    /* =====================
       STATUS TRACKING
    ===================== */

    status: {

      type: String,

      enum: [
        "Submitted",
        "Under Review",
        "Assigned",
        "In Progress",
        "Resolved",
        "Rejected",
      ],

      default: "Submitted",

    },

    assignedOfficer: {
      type:
        mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    priority: {

      type: String,

      enum: [
        "Low",
        "Normal",
        "High",
        "Emergency",
      ],

      default: "Normal",

    },

    /* =====================
       TIMELINE
    ===================== */

    timeline: [timelineSchema],

    /* =====================
       REAL-TIME FLAGS
    ===================== */

    escalation: {
      type: Boolean,
      default: false,
    },

    liveAlertSent: {
      type: Boolean,
      default: false,
    },

    /* =====================
       ANALYTICS
    ===================== */

    views: {
      type: Number,
      default: 0,
    },

    resolvedAt: {
      type: Date,
      default: null,
    },

    /* =====================
       TAGS
    ===================== */

    tags: {
      type: [String],
      default: [],
    },

  },
  {
    timestamps: true,
  });

/* =========================================
   EXPORT MODEL
========================================= */

module.exports =
  mongoose.model(
    "Complaint",
    complaintSchema
  );