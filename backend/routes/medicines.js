const express = require('express')
const router  = express.Router()
const Medicine = require('../models/Medicine')
const auth    = require('../middleware/protect')

// GET all medicines
router.get('/', auth, async (req, res) => {
  try {
    const medicines = await Medicine.find().sort({ name: 1 })
    res.json(medicines)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET low stock
router.get('/low-stock', auth, async (req, res) => {
  try {
    const medicines = await Medicine.find({
      $expr: { $lte: ['$quantity', '$threshold'] }
    })
    res.json(medicines)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST add medicine
router.post('/', auth, async (req, res) => {
  try {
    const medicine = await Medicine.create(req.body)
    res.json({ id: medicine._id, message: 'Medicine added' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PUT update medicine
router.put('/:id', auth, async (req, res) => {
  try {
    await Medicine.findByIdAndUpdate(req.params.id, req.body)
    res.json({ message: 'Medicine updated' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// DELETE medicine
router.delete('/:id', auth, async (req, res) => {
  try {
    await Medicine.findByIdAndDelete(req.params.id)
    res.json({ message: 'Medicine deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router