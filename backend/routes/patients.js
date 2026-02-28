const express = require('express')
const router  = express.Router()
const Patient = require('../models/Patient')
const auth    = require('../middleware/protect')

// GET all patients
router.get('/', async (req, res) => {
  try {
    const patients = await Patient.find().sort({ createdAt: -1 })
    res.json(patients)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET one patient
router.get('/:id', async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id)
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' })
    }
    res.json(patient)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST create patient
router.post('/', async (req, res) => {
  try {
    const patient = await Patient.create(req.body)
    res.json({ id: patient._id, message: 'Patient created' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PUT update patient
router.put('/:id', async (req, res) => {
  try {
    await Patient.findByIdAndUpdate(req.params.id, req.body)
    res.json({ message: 'Patient updated' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// DELETE patient
router.delete('/:id', async (req, res) => {
  try {
    await Patient.findByIdAndDelete(req.params.id)
    res.json({ message: 'Patient deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
