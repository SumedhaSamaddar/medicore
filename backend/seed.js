const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
require('dotenv').config()

const User = require('./models/User')
const Doctor = require('./models/Doctor')

mongoose.connect(process.env.MONGO_URI)

const seed = async () => {
  try {
    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10)
    await User.create({
      name: 'Admin',
      email: 'admin@medicore.com',
      password: hashedPassword,
      role: 'admin'
    })

    // Create doctors
    await Doctor.insertMany([
      { name: 'Dr. Mehta', specialization: 'General Physician', phone: '9876543210' },
      { name: 'Dr. Singh', specialization: 'Diabetologist', phone: '9123456789' },
      { name: 'Dr. Rao', specialization: 'Cardiologist', phone: '9988776655' }
    ])

    console.log('✅ Seed data created')
    process.exit()
  } catch (err) {
    console.log('❌ Error:', err.message)
    process.exit(1)
  }
}

seed()