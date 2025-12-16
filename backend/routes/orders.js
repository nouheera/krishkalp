const express = require("express");
const router = express.Router();
const Order = require("../models/Order.js");
const auth = require("../middleware/auth");

// CREATE ORDER
router.post("/", async (req, res) => {
  try {
    const newOrder = new Order(req.body);
    await newOrder.save();
    res.json({ success: true, message: "Order saved!" });
  } catch (err) {
    console.error("Order save error:", err);
    res.status(500).json({ success: false, message: "Failed to save order" });
  }
});

// GET ALL ORDERS (Admin)
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().sort({ date: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Failed to load orders" });
  }
});

module.exports = router;
