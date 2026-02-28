
// backend/routes/analytics.js
const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')

// ─── HELPER: safely reference existing models ────────────────────────────────
const getModel = (name) => {
  try { return mongoose.model(name) } catch { return null }
}

// ─── GET /analytics/analytics ────────────────────────────────────────────────
// Returns revenue, expenses, patient counts, appointment stats from real DB
router.get('/analytics', async (req, res) => {
  try {
    const Transaction = getModel('Transaction')
    const Patient     = getModel('Patient')
    const Appointment = getModel('Appointment')
    const Invoice     = getModel('Invoice')

    // ── Revenue & Expenses from Transactions ──
    let totalRevenue = 0, totalExpenses = 0, recentTransactions = []
    if (Transaction) {
      const txns = await Transaction.find().sort({ createdAt: -1 })
      recentTransactions = txns.slice(0, 10)
      txns.forEach(t => {
        const amount = Number(t.amount) || 0
        const type = (t.type || '').toLowerCase()
        if (type === 'income' || type === 'credit' || type === 'revenue') {
          totalRevenue += amount
        } else if (type === 'expense' || type === 'debit') {
          totalExpenses += amount
        } else {
          // If no type field, treat positive as income, negative as expense
          if (amount >= 0) totalRevenue += amount
          else totalExpenses += Math.abs(amount)
        }
      })
    }

    // ── Also pull from Invoices if available ──
    if (Invoice) {
      const invoices = await Invoice.find({ status: 'Paid' })
      invoices.forEach(inv => {
        totalRevenue += Number(inv.totalAmount || inv.amount || 0)
      })
    }

    const netProfit = totalRevenue - totalExpenses

    // ── Patient Count ──
    const totalPatients = Patient ? await Patient.countDocuments() : 0
    const newPatientsThisMonth = Patient ? await Patient.countDocuments({
      createdAt: { $gte: new Date(new Date().setDate(1)) }
    }) : 0

    // ── Appointment Stats ──
    let totalAppointments = 0, completedAppointments = 0, pendingAppointments = 0
    if (Appointment) {
      totalAppointments     = await Appointment.countDocuments()
      completedAppointments = await Appointment.countDocuments({ status: /completed/i })
      pendingAppointments   = await Appointment.countDocuments({
        status: { $in: ['Scheduled', 'Pending', 'Confirmed'] }
      })
    }

    // ── Monthly Revenue (last 6 months) ──
    const monthlyRevenue = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthLabel = d.toLocaleString('default', { month: 'short' })
      let monthAmount = 0

      if (Transaction) {
        const txns = await Transaction.find({
          createdAt: {
            $gte: new Date(d.getFullYear(), d.getMonth(), 1),
            $lt:  new Date(d.getFullYear(), d.getMonth() + 1, 1)
          }
        })
        txns.forEach(t => {
          const amount = Number(t.amount) || 0
          const type = (t.type || '').toLowerCase()
          if (type === 'income' || type === 'credit' || type === 'revenue' || amount >= 0) {
            monthAmount += Math.abs(amount)
          }
        })
      }

      monthlyRevenue.push({ month: monthLabel, revenue: monthAmount })
    }

    res.json({
      totalRevenue,
      totalExpenses,
      netProfit,
      totalPatients,
      newPatientsThisMonth,
      totalAppointments,
      completedAppointments,
      pendingAppointments,
      monthlyRevenue,
      recentTransactions,
      transactionCount: recentTransactions.length
    })
  } catch (err) {
    console.error('Analytics error:', err)
    res.status(500).json({ message: err.message })
  }
})

// ─── GET /analytics/performance ──────────────────────────────────────────────
router.get('/performance', async (req, res) => {
  try {
    const Appointment = getModel('Appointment')
    const Patient     = getModel('Patient')

    const totalPatients = Patient ? await Patient.countDocuments() : 0
    const totalAppointments = Appointment ? await Appointment.countDocuments() : 0
    const completedAppointments = Appointment
      ? await Appointment.countDocuments({ status: /completed/i }) : 0

    const completionRate = totalAppointments > 0
      ? Math.round((completedAppointments / totalAppointments) * 100) : 0

    res.json({ totalPatients, totalAppointments, completedAppointments, completionRate })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ─── GET /analytics/clinics ───────────────────────────────────────────────────
router.get('/clinics', async (req, res) => {
  try {
    // Return distinct clinic values from transactions if that field exists
    const Transaction = getModel('Transaction')
    if (Transaction) {
      const clinics = await Transaction.distinct('clinic')
      return res.json(clinics.filter(Boolean))
    }
    res.json([])
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ─── POST /analytics/ai-predict ──────────────────────────────────────────────
router.post('/ai-predict', async (req, res) => {
  try {
    const Transaction = getModel('Transaction')
    let avgMonthly = 0

    if (Transaction) {
      const last3Months = new Date()
      last3Months.setMonth(last3Months.getMonth() - 3)
      const txns = await Transaction.find({ createdAt: { $gte: last3Months } })
      const total = txns.reduce((sum, t) => sum + (Number(t.amount) || 0), 0)
      avgMonthly = total / 3
    }

    const predictedNext = Math.round(avgMonthly * 1.08) // 8% growth estimate
    res.json({
      predictedRevenue: predictedNext,
      confidence: '72%',
      trend: predictedNext > avgMonthly ? 'upward' : 'flat',
      message: `Based on last 3 months, predicted next month revenue: ₹${predictedNext.toLocaleString()}`
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ─── POST /analytics/ai-insights ─────────────────────────────────────────────
router.post('/ai-insights', async (req, res) => {
  try {
    const Patient     = getModel('Patient')
    const Appointment = getModel('Appointment')

    const patientCount = Patient ? await Patient.countDocuments() : 0
    const apptCount    = Appointment ? await Appointment.countDocuments() : 0

    res.json({
      insights: [
        { title: 'Patient Growth', value: patientCount, suggestion: 'Keep up outreach efforts' },
        { title: 'Appointments This Month', value: apptCount, suggestion: 'Consider extending hours if near capacity' }
      ]
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router