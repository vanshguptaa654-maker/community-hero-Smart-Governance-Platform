const jwt = require("jsonwebtoken");

/* =========================================
   JWT AUTH MIDDLEWARE
========================================= */

module.exports = function (
  roles = []
) {

  return async (
    req,
    res,
    next
  ) => {

    try {

      /* =====================
         GET TOKEN
      ===================== */

      const token =
        req.headers.authorization;

      if (!token) {

        return res.status(401).json({

          success: false,

          message:
            "Access denied. No token provided.",

        });

      }

      /* =====================
         VERIFY TOKEN
      ===================== */

      const decoded =
        jwt.verify(
          token,
          process.env.JWT_SECRET
        );

      /* =====================
         ATTACH USER
      ===================== */

      req.user = decoded;

      /* =====================
         ROLE AUTHORIZATION
      ===================== */

      if (
        roles.length > 0 &&
        !roles.includes(
          decoded.role
        )
      ) {

        return res.status(403).json({

          success: false,

          message:
            "Forbidden. Access denied.",

        });

      }

      /* =====================
         CONTINUE
      ===================== */

      next();

    } catch (error) {

      console.log(
        "JWT Error:",
        error.message
      );

      return res.status(401).json({

        success: false,

        message:
          "Invalid or expired token.",

      });

    }
  };
};