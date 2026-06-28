const mongoose = require("mongoose");

/* =========================================
   USER SCHEMA
========================================= */

const userSchema =
  new mongoose.Schema({

    /* =====================
       FULL NAME
    ===================== */

    name: {
      type: String,
      required: true,
      trim: true,
    },

    /* =====================
       USERNAME
    ===================== */

    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    /* =====================
       PASSWORD
    ===================== */

    password: {
      type: String,
      required: true,
    },

    /* =====================
       ROLE
    ===================== */

    role: {
      type: String,

      enum: [
        "admin",
        "officer",
        "citizen",
      ],

      default: "citizen",
    },

    /* =====================
       OPTIONAL DEPARTMENT
       (FOR OFFICERS)
    ===================== */

    department: {
      type: String,
      default: "General",
    },

    /* =====================
       ACCOUNT STATUS
    ===================== */

    active: {
      type: Boolean,
      default: true,
    },

    /* =====================
       LAST LOGIN
    ===================== */

    lastLogin: {
      type: Date,
      default: null,
    },

    /* =====================
       PROFILE IMAGE
    ===================== */

    profileImage: {
      type: String,
      default: "",
    },

    /* =====================
       CONTACT NUMBER
    ===================== */

    phone: {
      type: String,
      default: "",
    },

    /* =====================
       ADDRESS
    ===================== */

    address: {
      type: String,
      default: "",
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
    "User",
    userSchema
  );