const mongoose = require("mongoose");

const pendingPriceSchema = new mongoose.Schema({
  item: {
    type: String,
    required: true,
    uppercase: true,
  },
  basePrice: {
    type: Number,
    required: true,
  },
  gst: {
    type: Number,
    required: true,
  },
  mrp: {
    type: Number,
    required: true,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model("PendingPrice", pendingPriceSchema);
