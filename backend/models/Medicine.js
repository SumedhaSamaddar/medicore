const mongoose = require('mongoose')

const medicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: String,
  quantity: {
    type: Number,
    default: 0
  },
  threshold: {
    type: Number,
    default: 50
  },
  expiry: Date,
  supplier: String,
  price: Number
}, { timestamps: true })

module.exports = mongoose.model('Medicine', medicineSchema)