const mongoose = require("mongoose"),
  custodianSchema = new mongoose.Schema({
    child: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "childs",
      require: true,
    },
    name: String,
    occupation: String,
    id_card: String,
    email: String,
    telephone: String,
    relationship: String,
    url: String,
    date_sign: Date,
    line_id: String,
  });
module.exports = mongoose.model("guardians", custodianSchema);
