const mongoose = require("mongoose"),
  attendanceSchema = mongoose.Schema({
    child: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "childs",
      require: true,
    },
    date: Date,
    updateOn: Date,
    attend: Boolean,
  });
module.exports = mongoose.model("attendances", attendanceSchema);
