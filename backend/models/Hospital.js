const mongoose = require('mongoose')

const hospitalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  address: String,
  contact: String,
  distance: String,
  beds: {
    icu: {
      total: { type: Number, default: 0 },
      available: { type: Number, default: 0 }
    },
    general: {
      total: { type: Number, default: 0 },
      available: { type: Number, default: 0 }
    },
    emergency: {
      total: { type: Number, default: 0 },
      available: { type: Number, default: 0 }
    }
  },
  hasAmbulance: {
    type: Boolean,
    default: false
  },
  ambulanceETA: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true })

module.exports = mongoose.model('Hospital', hospitalSchema)