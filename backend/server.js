const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const path = require('path')
require('dotenv').config()

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// API Routes FIRST (before static files)
app.use('/api/auth', require('./routes/auth'))
app.use('/api/patients', require('./routes/patients'))
app.use('/api/doctors', require('./routes/doctors'))
app.use('/api/appointments', require('./routes/appointments'))
app.use('/api/medicines', require('./routes/medicines'))
app.use('/api/invoices', require('./routes/invoices'))
app.use('/api/ai', require('./routes/ai'))
app.use('/api/emergency', require('./routes/emergency'))
app.use('/api/analytics', require('./routes/analytics'))

// Serve frontend static files in production
// Serve frontend static files in production
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '../frontend/build')
  app.use(express.static(buildPath))
  
  // Catch all other routes - serve index.html
  app.get('/*', (req, res) => {  // CHANGED FROM '*' TO '/*'
    res.sendFile(path.join(buildPath, 'index.html'))
  })
}

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected')
    const PORT = process.env.PORT || 10000
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`)
    })
  })
  .catch(err => {
    console.error('❌ MongoDB error:', err)
  })