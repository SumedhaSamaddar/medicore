const express = require('express')
const router  = express.Router()
const Invoice = require('../models/Invoice')
const auth    = require('../middleware/protect')

// GET all invoices
router.get('/', auth, async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate('patient', 'name phone')
      .populate('doctor', 'name')
      .sort({ createdAt: -1 })
    res.json(invoices)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST create invoice
router.post('/', auth, async (req, res) => {
  try {
    const invoice = await Invoice.create(req.body)
    res.json({ id: invoice._id, message: 'Invoice created' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PUT mark as paid
router.put('/:id/pay', auth, async (req, res) => {
  try {
    await Invoice.findByIdAndUpdate(req.params.id, { status: 'Paid' })
    res.json({ message: 'Marked as paid' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// DELETE invoice
router.delete('/:id', auth, async (req, res) => {
  try {
    await Invoice.findByIdAndDelete(req.params.id)
    res.json({ message: 'Invoice deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router