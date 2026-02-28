const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const path = require('path')
require('dotenv').config()
const app = express()
// Middleware
app.use(cors())
app.use(express.json())
// API Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/patients', require('./routes/patients'))
app.use('/api/doctors', require('./routes/doctors'))
app.use('/api/appointments', require('./routes/appointments'))
app.use('/api/medicines', require('./routes/medicines'))
app.use('/api/invoices', require('./routes/invoices'))
app.use('/api/transactions', require('./routes/transaction'))
app.use('/api/ai', require('./routes/ai'))  // AI Symptom Checker route
app.use('/api/emergency', require('./routes/emergency'))
app.use('/api/analytics', require('./routes/analytics'))
// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  })
})
// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '../frontend/build')
  app.use(express.static(buildPath))
  
  app.use((req, res) => {
    if (!req.path.startsWith('/api') && !req.path.startsWith('/health')) {
      res.sendFile(path.join(buildPath, 'index.html'))
    }
  })
}
// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack)
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  })
})
// Connect to MongoDB and start server
const PORT = process.env.PORT || 10000
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI
if (!MONGODB_URI) {
  console.error('❌ MongoDB URI not found in environment variables')
  process.exit(1)
}
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully')
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Server running on port ${PORT}`)
      console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`)
      console.log(`🤖 OpenAI API Key: ${process.env.OPENAI_API_KEY ? 'Present' : 'Missing'}`)
      
      // Log all registered routes
      console.log('\n📋 Registered Routes:')
      app._router.stack.forEach((r) => {
        if (r.route && r.route.path) {
          console.log(`   ${Object.keys(r.route.methods).join(', ').toUpperCase()} ${r.route.path}`)
        }
      })
    })
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err)
    process.exit(1)
  })
// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...')
  mongoose.connection.close(false, () => {
    console.log('MongoDB connection closed')
    process.exit(0)
  })
})
process.on('SIGINT', () => {
  console.log('SIGINT received, closing server...')
  mongoose.connection.close(false, () => {
    console.log('MongoDB connection closed')
    process.exit(0)
  })
})
module.exports = app