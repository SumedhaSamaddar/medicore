const mongoose = require('mongoose')

const patientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  age: Number,
  phone: String,
  email: String,
  blood_group: String,
  allergies: [String],
  address: String,
  emergency_contact: String
}, { timestamps: true })

module.exports = mongoose.model('Patient', patientSchema)