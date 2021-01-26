const mongoose = require("mongoose"),
  childSchema = new mongoose.Schema({
    firstname: String,
    middlename: String,
    lastname: String,
    gender: Number,
    nickname: String,
    birth_date: Date,
  });

module.exports = mongoose.model("childs", childSchema);
