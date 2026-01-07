const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

// TEST route
router.get("/test", (req, res) => {
  res.send("Products API is working");
});

// GET ALL PRODUCTS
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

router.put("/:id", async (req, res) => {
  const { stock } = req.body;

  await Product.findByIdAndUpdate(req.params.id, { stock });
  res.json({ success: true });
});
