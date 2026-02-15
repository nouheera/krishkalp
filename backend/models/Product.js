const mongoose = require("mongoose");

const unitSchema = new mongoose.Schema(
  {
    key: String,
    label: String,
    price: Number
  },
  { _id: false }
);

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: String,
  units: [unitSchema],
  image: String,
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Product", productSchema);
