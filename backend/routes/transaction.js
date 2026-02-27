const router = require("express").Router()
const Transaction = require("../models/Transaction")

// GET all transactions
router.get("/", async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ date: -1 })
    res.json(transactions)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// CREATE transaction
router.post("/", async (req, res) => {
  try {
    const transaction = await Transaction.create(req.body)
    res.status(201).json(transaction)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// DELETE transaction
router.delete("/:id", async (req, res) => {
  try {
    await Transaction.findByIdAndDelete(req.params.id)
    res.json({ message: "Transaction deleted" })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router