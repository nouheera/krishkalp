const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  id: String,
  name: String,
  phone: String,
  address: String,
  items: [
    {
      productId: String,
      name: String,
      unit: String,
      qty: Number,
      price: Number,
      total: Number
    }
  ],
  total: Number,
  date: String,
  status: String
});

module.exports = mongoose.model("Order", orderSchema);
