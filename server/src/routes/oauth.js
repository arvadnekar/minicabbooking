const express = require("express");
const passport = require("passport");
const router = express.Router();

// Start OAuth login
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  (req, res) => {
    const jwt = require("jsonwebtoken");
    const token = jwt.sign(
      { userId: req.user._id },
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
      maxAge: 3600000,
    });

    res.redirect("http://localhost:3001");
  }
);


module.exports = router;
