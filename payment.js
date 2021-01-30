const mongoose = require("mongoose"),
  paymentSchema = mongoose.Schema({
    child: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "childs",
      require: true,
    },
    start_date: Date,
    updateOn: Date,
    topic: String,
    type: String,
    total_price: Number,
    outstanding_balance: Number,
    status: String,
    slip: [String],
  });
module.exports = mongoose.model("payment", paymentSchema);
