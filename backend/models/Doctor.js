const mongoose = require('mongoose')

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  specialization: String,
  phone: String,
  available: {
    type: Boolean,
    default: true
  }
}, { timestamps: true })

module.exports = mongoose.model('Doctor', doctorSchema)