const express  = require('express')
const mongoose = require('mongoose')
const cors     = require('cors')
require('dotenv').config()

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.log('❌ MongoDB error:', err.message))

// Routes
app.use('/api/auth',         require('./routes/auth'))
app.use('/api/patients',     require('./routes/patients'))
app.use('/api/doctors',      require('./routes/doctors'))
app.use('/api/appointments', require('./routes/appointments'))
app.use('/api/medicines',    require('./routes/medicines'))
app.use('/api/invoices',     require('./routes/invoices'))
app.use('/api/ai',           require('./routes/ai'))

// Test route
app.get('/', (req, res) => {
  res.json({ message: '✅ MediCore API is running' })
})

app.listen(process.env.PORT, () => {
  console.log(`✅ Server running on http://localhost:${process.env.PORT}`)
})