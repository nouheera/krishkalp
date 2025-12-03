const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  username: String,
  password: String, // hashed later if needed
});

module.exports = mongoose.model("Admin", adminSchema);

