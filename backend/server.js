const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const path = require('path')
require('dotenv').config()

const app = express()

app.use(cors())
app.use(express.json())

// API Routes - Based on files you ACTUALLY have
app.use('/api/auth', require('./routes/auth'))
app.use('/api/patients', require('./routes/patients'))
app.use('/api/doctors', require('./routes/doctors'))
app.use('/api/appointments', require('./routes/appointments'))
app.use('/api/medicines', require('./routes/medicines'))
app.use('/api/invoices', require('./routes/invoices'))
app.use('/api/transactions', require('./routes/transaction'))
app.use('/api/ai', require('./routes/ai'))
app.use('/api/emergency', require('./routes/emergency'))
app.use('/api/analytics', require('./routes/analytics'))

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '../frontend/build')
  app.use(express.static(buildPath))
  
  app.use((req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(buildPath, 'index.html'))
    }
  })
}

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected')
    const PORT = process.env.PORT || 10000
    app.listen(PORT, () => console.log(`✅ Server on port ${PORT}`))
  })
  .catch(err => console.error('❌ Error:', err))