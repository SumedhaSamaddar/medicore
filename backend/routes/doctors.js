const express = require('express')
const router  = express.Router()
const Doctor  = require('../models/Doctor')
const auth    = require('../middleware/protect')

// GET all doctors
router.get('/', auth, async (req, res) => {
  try {
    const doctors = await Doctor.find()
    res.json(doctors)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST add doctor
router.post('/', auth, async (req, res) => {
  try {
    const doctor = await Doctor.create(req.body)
    res.json({ id: doctor._id, message: 'Doctor added' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router