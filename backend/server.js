// ================= IMPORTS =================
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const path = require('path')
require('dotenv').config()

const User = require('./models/User')

// ================= APP INIT =================
const app = express()

// ================= MIDDLEWARE =================
app.use(cors())
app.use(express.json())

// ================= HEALTH CHECK =================
app.get('/api/health', (req, res) => {
  res.json({ status: 'API Running' })
})

// ================= API ROUTES =================
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

// ================= SERVE FRONTEND (PRODUCTION) =================
// ================= SERVE FRONTEND (PRODUCTION) =================
// ================= SERVE FRONTEND (PRODUCTION) =================
if (process.env.NODE_ENV === 'production') {
  // Your React build is in the root 'build' folder, not in frontend/build
  const buildPath = path.join(__dirname, '../frontend/build')
  
  console.log('Serving static files from:', buildPath)
  
  app.use(express.static(buildPath))
  
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) return next()
    res.sendFile(path.join(buildPath, 'index.html'))
  })
}
// ================= API 404 =================
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API route not found' })
})

// ================= GLOBAL ERROR HANDLER =================
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Something went wrong!' })
})

// ================= DB CONNECT & START =================
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB connected')

    // ===== Seed Default Admin =====
    try {
      const adminEmail = 'admin@example.com'
      const adminPassword = 'admin123'

      const existingAdmin = await User.findOne({ email: adminEmail })

      if (!existingAdmin) {
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(adminPassword, salt)

        await new User({
          name: 'Admin',
          email: adminEmail,
          password: hashedPassword,
          role: 'admin'
        }).save()

        console.log(`✅ Default admin created: ${adminEmail}`)
      } else {
        console.log('✅ Admin already exists')
      }
    } catch (err) {
      console.error('❌ Admin seed error:', err)
    }

    const PORT = process.env.PORT || 5000
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`)
    })
  })
  .catch(err => console.error('❌ MongoDB connection error:', err))