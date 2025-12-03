const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

// ADMIN LOGIN
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  // Hardcoded default admin (you can store in DB)
  const adminUser = await Admin.findOne({ username });

  if (!adminUser || adminUser.password !== password) {
    return res.json({ success: false, message: "Invalid credentials" });
  }

  // Generate token
  const token = jwt.sign(
    { username },
    process.env.JWT_SECRET || "secret123",
    { expiresIn: "7d" }
  );

  res.json({ success: true, token });
});

module.exports = router;
