const mongoose = require('mongoose')

const appointmentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: String,
  issue: String,
  status: {
    type: String,
    enum: ['Waiting', 'In Progress', 'Done', 'Cancelled'],
    default: 'Waiting'
  }
}, { timestamps: true })

module.exports = mongoose.model('Appointment', appointmentSchema)