const mongoose = require('mongoose')
const healthSchema = mongoose.Schema({
  child: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'childs'
  },
  breakfast: Boolean,
  cloth: Boolean,
  head: Boolean,
  ear: Boolean,
  nail: Boolean,
  skin: Boolean,
  temperature: Boolean,
  wound: Boolean,
  date: Date,
  updateOn: Date
})

module.exports = mongoose.model('healths', healthSchema)
