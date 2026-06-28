const mongoose = require("mongoose");

/* =========================================
   ALERT SCHEMA
========================================= */

const alertSchema =
  new mongoose.Schema({

    /* =====================
       ALERT MESSAGE
    ===================== */

    message: {
      type: String,
      required: true,
      trim: true,
    },

    /* =====================
       ALERT TYPE
    ===================== */

    type: {

      type: String,

      enum: [
        "Critical Complaint",
        "Escalation",
        "System",
        "Security",
        "AI Detection",
        "Duplicate Complaint",
        "Emergency",
      ],

      default: "System",

    },

    /* =====================
       ALERT SEVERITY
    ===================== */

    severity: {

      type: String,

      enum: [
        "Low",
        "Medium",
        "High",
        "Critical",
      ],

      default: "Medium",

    },

    /* =====================
       RELATED COMPLAINT
    ===================== */

    complaintId: {
      type:
        mongoose.Schema.Types.ObjectId,
      ref: "Complaint",
      default: null,
    },

    /* =====================
       RELATED USER
    ===================== */

    userId: {
      type:
        mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    /* =====================
       DEPARTMENT
    ===================== */

    department: {
      type: String,
      default:
        "General Administration",
    },

    /* =====================
       ALERT STATUS
    ===================== */

    status: {

      type: String,

      enum: [
        "Unread",
        "Read",
        "Resolved",
      ],

      default: "Unread",

    },

    /* =====================
       REAL-TIME FLAG
    ===================== */

    live: {
      type: Boolean,
      default: true,
    },

    /* =====================
       ESCALATION
    ===================== */

    escalationLevel: {

      type: Number,

      default: 0,

    },

    /* =====================
       AI GENERATED
    ===================== */

    aiGenerated: {
      type: Boolean,
      default: false,
    },

    /* =====================
       NOTIFICATION FLAGS
    ===================== */

    emailSent: {
      type: Boolean,
      default: false,
    },

    smsSent: {
      type: Boolean,
      default: false,
    },

    pushSent: {
      type: Boolean,
      default: false,
    },

    /* =====================
       LOCATION INFO
    ===================== */

    location: {

      lat: {
        type: Number,
        default: null,
      },

      lng: {
        type: Number,
        default: null,
      },

      ward: {
        type: String,
        default: "",
      },

    },

    /* =====================
       EXTRA METADATA
    ===================== */

    metadata: {
      type: Object,
      default: {},
    },

  },
  {
    timestamps: true,
  });

/* =========================================
   INDEXES
========================================= */

alertSchema.index({
  severity: 1,
});

alertSchema.index({
  status: 1,
});

alertSchema.index({
  createdAt: -1,
});

/* =========================================
   EXPORT MODEL
========================================= */

module.exports =
  mongoose.model(
    "Alert",
    alertSchema
  );