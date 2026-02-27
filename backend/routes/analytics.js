const express = require('express')
const router = express.Router()
const auth = require('../middleware/protect')
const Transaction = require('../models/Transaction')
const Invoice = require('../models/Invoice')
const Patient = require('../models/Patient')
const Appointment = require('../models/Appointment')
const Medicine = require('../models/Medicine')

// ========== ANALYTICS ==========

// GET business analytics
router.get('/analytics', auth, async (req, res) => {
  try {
    const { clinic } = req.query
    const filter = clinic ? { clinic } : {}

    // Current month dates
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    // Last 6 months
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    // Total income from transactions
    const income = await Transaction.aggregate([
      { $match: { type: 'Income', ...filter } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])

    // Total expenses from transactions
    const expenses = await Transaction.aggregate([
      { $match: { type: 'Expense', ...filter } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])

    // This month income
    const monthIncome = await Transaction.aggregate([
      { 
        $match: { 
          type: 'Income', 
          date: { $gte: startOfMonth, $lte: endOfMonth },
          ...filter 
        } 
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])

    // This month expenses
    const monthExpenses = await Transaction.aggregate([
      { 
        $match: { 
          type: 'Expense', 
          date: { $gte: startOfMonth, $lte: endOfMonth },
          ...filter 
        } 
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])

    // Monthly trends (last 6 months)
    const monthlyData = await Transaction.aggregate([
      { $match: { date: { $gte: sixMonthsAgo }, ...filter } },
      {
        $group: {
          _id: {
            month: { $month: '$date' },
            year: { $year: '$date' },
            type: '$type'
          },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ])

    // Expense category breakdown
    const expenseBreakdown = await Transaction.aggregate([
      { $match: { type: 'Expense', ...filter } },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' }
        }
      },
      { $sort: { total: -1 } }
    ])

    // Income category breakdown
    const incomeBreakdown = await Transaction.aggregate([
      { $match: { type: 'Income', ...filter } },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' }
        }
      },
      { $sort: { total: -1 } }
    ])

    // Patient stats
    const totalPatients = await Patient.countDocuments()
    const newPatientsThisMonth = await Patient.countDocuments({
      createdAt: { $gte: startOfMonth, $lte: endOfMonth }
    })
    
    const activePatients = await Appointment.distinct('patient', {
      date: { $gte: startOfMonth, $lte: endOfMonth }
    })

    // Appointment stats
    const totalAppointments = await Appointment.countDocuments({
      date: { $gte: startOfMonth, $lte: endOfMonth }
    })
    
    const completedAppointments = await Appointment.countDocuments({
      date: { $gte: startOfMonth, $lte: endOfMonth },
      status: 'Done'
    })

    // Invoice stats
    const pendingInvoices = await Invoice.countDocuments({ status: 'Pending' })
    const pendingAmount = await Invoice.aggregate([
      { $match: { status: 'Pending' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])

    // Medicine stats
    const lowStockMedicines = await Medicine.countDocuments({
      $expr: { $lte: ['$quantity', '$threshold'] }
    })

    const totalIncome = income[0]?.total || 0
    const totalExpenses = expenses[0]?.total || 0
    const thisMonthIncome = monthIncome[0]?.total || 0
    const thisMonthExpenses = monthExpenses[0]?.total || 0
    
    res.json({
      // Financial metrics
      totalIncome,
      totalExpenses,
      netProfit: totalIncome - totalExpenses,
      profitMargin: totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100).toFixed(1) : 0,
      thisMonthIncome,
      thisMonthExpenses,
      thisMonthProfit: thisMonthIncome - thisMonthExpenses,
      
      // Breakdowns
      expenseBreakdown,
      incomeBreakdown,
      monthlyTrends: monthlyData,
      
      // Patient metrics
      totalPatients,
      newPatientsThisMonth,
      activePatients: activePatients.length,
      avgRevenuePerPatient: activePatients.length > 0 ? (thisMonthIncome / activePatients.length).toFixed(0) : 0,
      
      // Operational metrics
      totalAppointments,
      completedAppointments,
      appointmentCompletionRate: totalAppointments > 0 ? ((completedAppointments / totalAppointments) * 100).toFixed(1) : 0,
      pendingInvoices,
      pendingAmount: pendingAmount[0]?.total || 0,
      lowStockMedicines
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET clinic list
router.get('/clinics', auth, async (req, res) => {
  try {
    const clinics = await Transaction.distinct('clinic')
    res.json(clinics)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ========== AI PREDICTIONS ==========

// POST AI revenue prediction
router.post('/ai-predict', auth, async (req, res) => {
  try {
    // Get last 6 months revenue
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const monthlyRevenue = await Transaction.aggregate([
      { $match: { type: 'Income', date: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            month: { $month: '$date' },
            year: { $year: '$date' }
          },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ])

    const revenueData = monthlyRevenue.map(m => m.total).join(', ')
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const monthlyDetails = monthlyRevenue.map(m => 
      `${monthNames[m._id.month - 1]} ${m._id.year}: ₹${m.total}`
    ).join(', ')

    // Try OpenAI
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'dummy_key_using_fallback') {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [{
              role: 'user',
              content: `You are a healthcare business analyst. Analyze this monthly revenue data: ${monthlyDetails}

Respond ONLY with valid JSON (no markdown, no backticks):
{
  "predictedNextMonth": number,
  "confidence": "High/Medium/Low",
  "trend": "Growing/Stable/Declining",
  "growthRate": number (percentage),
  "insights": ["insight1", "insight2", "insight3"],
  "recommendations": ["rec1", "rec2", "rec3"],
  "risks": ["risk1", "risk2"]
}`
            }],
            max_tokens: 500,
            temperature: 0.7
          })
        })

        const data = await response.json()
        
        if (!data.error) {
          let text = data.choices[0].message.content
          text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
          const prediction = JSON.parse(text)
          return res.json(prediction)
        }
      } catch (aiError) {
        console.log('AI API failed, using fallback')
      }
    }

    // Fallback prediction
    const revenues = monthlyRevenue.map(m => m.total)
    const avgRevenue = revenues.reduce((a, b) => a + b, 0) / revenues.length
    const lastMonth = revenues[revenues.length - 1] || avgRevenue
    const firstMonth = revenues[0] || lastMonth
    
    // Calculate trend
    const growthRate = revenues.length > 1 
      ? (((lastMonth - firstMonth) / firstMonth) * 100).toFixed(1) 
      : 0
    
    // Predict next month (simple linear projection)
    const predicted = Math.round(lastMonth * (1 + (growthRate / 100)))

    res.json({
      predictedNextMonth: predicted,
      confidence: revenues.length >= 4 ? 'Medium' : 'Low',
      trend: lastMonth > avgRevenue ? 'Growing' : lastMonth < avgRevenue * 0.9 ? 'Declining' : 'Stable',
      growthRate: parseFloat(growthRate),
      insights: [
        `Average monthly revenue: ₹${Math.round(avgRevenue).toLocaleString()}`,
        `Last month revenue: ₹${lastMonth.toLocaleString()}`,
        `${revenues.length} months of data analyzed`,
        predicted > lastMonth ? 'Upward trajectory detected' : 'Revenue stabilizing'
      ],
      recommendations: [
        'Focus on patient retention programs',
        'Introduce health checkup packages',
        'Optimize appointment scheduling to reduce no-shows',
        growthRate < 5 ? 'Consider marketing campaigns to boost patient acquisition' : 'Maintain current growth strategy'
      ],
      risks: [
        revenues.length < 3 ? 'Limited historical data for accurate predictions' : null,
        lastMonth < avgRevenue * 0.8 ? 'Revenue declining significantly' : null,
        growthRate < 0 ? 'Negative growth trend' : null
      ].filter(Boolean)
    })
  } catch (err) {
    console.error('Prediction Error:', err.message)
    res.status(500).json({ message: 'Failed to generate prediction' })
  }
})

// POST AI business insights
router.post('/ai-insights', auth, async (req, res) => {
  try {
    // Get financial data
    const analytics = await Transaction.aggregate([
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' }
        }
      }
    ])

    const income = analytics.find(a => a._id === 'Income')?.total || 0
    const expenses = analytics.find(a => a._id === 'Expense')?.total || 0
    const profit = income - expenses
    const margin = income > 0 ? ((profit / income) * 100).toFixed(1) : 0

    // Get top expense categories
    const topExpenses = await Transaction.aggregate([
      { $match: { type: 'Expense' } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
      { $sort: { total: -1 } },
      { $limit: 3 }
    ])

    const expenseDetails = topExpenses.map(e => `${e._id}: ₹${e.total.toLocaleString()}`).join(', ')

    // Try OpenAI
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'dummy_key_using_fallback') {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [{
              role: 'user',
              content: `As a healthcare business consultant, analyze this clinic's finances:
- Total Income: ₹${income.toLocaleString()}
- Total Expenses: ₹${expenses.toLocaleString()}
- Net Profit: ₹${profit.toLocaleString()}
- Profit Margin: ${margin}%
- Top Expenses: ${expenseDetails}

Provide actionable insights in JSON (no markdown):
{
  "overallHealth": "Excellent/Good/Fair/Poor",
  "keyStrengths": ["strength1", "strength2"],
  "areasOfConcern": ["concern1", "concern2"],
  "actionItems": ["action1", "action2", "action3"],
  "costOptimization": ["tip1", "tip2"],
  "revenueBoost": ["idea1", "idea2"]
}`
            }],
            max_tokens: 500,
            temperature: 0.7
          })
        })

        const data = await response.json()
        
        if (!data.error) {
          let text = data.choices[0].message.content
          text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
          const insights = JSON.parse(text)
          return res.json(insights)
        }
      } catch (aiError) {
        console.log('AI API failed, using fallback')
      }
    }

    // Fallback insights
    res.json({
      overallHealth: margin > 30 ? 'Excellent' : margin > 15 ? 'Good' : margin > 5 ? 'Fair' : 'Poor',
      keyStrengths: [
        income > 100000 ? 'Strong revenue generation' : 'Stable patient base',
        profit > 0 ? 'Profitable operations' : 'Revenue covers basic operations',
        margin > 20 ? 'Healthy profit margins' : 'Room for margin improvement'
      ].slice(0, 2),
      areasOfConcern: [
        margin < 15 ? 'Profit margins need improvement' : null,
        expenses > income * 0.8 ? 'High expense ratio' : null,
        profit < 0 ? 'Operating at a loss' : null
      ].filter(Boolean),
      actionItems: [
        'Review and negotiate supplier contracts quarterly',
        'Implement patient referral program with incentives',
        'Optimize staff scheduling to reduce overtime costs',
        margin < 10 ? 'Focus on increasing patient volume' : 'Maintain current service quality'
      ],
      costOptimization: [
        'Negotiate bulk purchase discounts for medical supplies',
        'Reduce energy costs with efficient equipment and LED lighting',
        'Implement digital systems to reduce paper and administrative costs'
      ],
      revenueBoost: [
        'Launch preventive health checkup packages',
        'Start corporate wellness programs for local businesses',
        'Introduce telemedicine consultations for follow-ups',
        'Create patient loyalty programs'
      ]
    })
  } catch (err) {
    console.error('Insights Error:', err.message)
    res.status(500).json({ message: 'Failed to generate insights' })
  }
})

// GET performance metrics
router.get('/performance', auth, async (req, res) => {
  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    // This month vs last month comparison
    const thisMonthIncome = await Transaction.aggregate([
      { $match: { type: 'Income', date: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])

    const lastMonthIncome = await Transaction.aggregate([
      { $match: { type: 'Income', date: { $gte: lastMonth, $lte: endOfLastMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])

    const thisMonthPatients = await Appointment.distinct('patient', {
      date: { $gte: startOfMonth }
    })

    const lastMonthPatients = await Appointment.distinct('patient', {
      date: { $gte: lastMonth, $lte: endOfLastMonth }
    })

    const thisIncome = thisMonthIncome[0]?.total || 0
    const lastIncome = lastMonthIncome[0]?.total || 1
    const incomeGrowth = ((thisIncome - lastIncome) / lastIncome * 100).toFixed(1)

    const thisPatients = thisMonthPatients.length
    const lastPatients = lastMonthPatients.length || 1
    const patientGrowth = ((thisPatients - lastPatients) / lastPatients * 100).toFixed(1)

    res.json({
      thisMonth: {
        income: thisIncome,
        patients: thisPatients
      },
      lastMonth: {
        income: lastIncome,
        patients: lastPatients
      },
      growth: {
        income: parseFloat(incomeGrowth),
        patients: parseFloat(patientGrowth)
      }
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router