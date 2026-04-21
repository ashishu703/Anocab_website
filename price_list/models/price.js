const mongoose = require("mongoose");
const PriceSchema = new mongoose.Schema({
  item: { type: String, required: true, unique: true },
  basePrice: Number,
  gst: Number,
  mrp: Number,
});
module.exports = mongoose.model("Price", PriceSchema);
