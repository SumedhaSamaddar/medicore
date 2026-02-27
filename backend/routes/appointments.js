const express = require('express')
const router  = express.Router()
const Appointment = require('../models/Appointment')
const auth    = require('../middleware/protect')

// GET all appointments with patient + doctor names
router.get('/', auth, async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('patient', 'name phone')
      .populate('doctor', 'name specialization')
      .sort({ date: -1 })
    res.json(appointments)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST create appointment
router.post('/', auth, async (req, res) => {
  try {
    const appointment = await Appointment.create(req.body)
    res.json({ id: appointment._id, message: 'Appointment booked' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PUT update status
router.put('/:id/status', auth, async (req, res) => {
  try {
    await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status }
    )
    res.json({ message: 'Status updated' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// DELETE appointment
router.delete('/:id', auth, async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id)
    res.json({ message: 'Appointment deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router