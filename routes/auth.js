const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();

const User = require("../models/User");

/* =========================
   REGISTER
========================= */

router.post("/register", async (req, res) => {

  try {

    const {
      name,
      username,
      phone,
      address,
      password,
      role
    } = req.body;

    /* =====================
       CHECK USER
    ===================== */

    const existingUser =
      await User.findOne({ username });

    if (existingUser) {

      return res.status(400).json({

        success: false,

        message: "Username already exists"

      });

    }

    /* =====================
       HASH PASSWORD
    ===================== */

    const hashedPassword =
      await bcrypt.hash(password, 10);

    /* =====================
       CREATE USER
    ===================== */

    const user =
      await User.create({

        name,

        username,

        phone,

        address,

        password: hashedPassword,

        role: role || "citizen"

      });

    res.json({

      success: true,

      message: "Registration successful",

      user

    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      success: false,

      message: "Server Error"

    });

  }

});

/* =========================
   LOGIN
========================= */

router.post("/login", async (req, res) => {

  try {

    const {
      username,
      password
    } = req.body;

    const user =
      await User.findOne({ username });

    if (!user) {

      return res.status(400).json({

        success: false,

        message: "Invalid credentials"

      });

    }

    /* =====================
       PASSWORD MATCH
    ===================== */

    const isMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isMatch) {

      return res.status(400).json({

        success: false,

        message: "Invalid credentials"

      });

    }

    /* =====================
       JWT TOKEN
    ===================== */

    const token =
      jwt.sign(

        {
          id: user._id,
          role: user.role
        },

        process.env.JWT_SECRET,

        {
          expiresIn: "7d"
        }

      );

    res.json({

      success: true,

      token,

      user

    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      success: false,

      message: "Server Error"

    });

  }

});

module.exports = router;