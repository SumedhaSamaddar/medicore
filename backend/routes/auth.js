const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

// POST - Register new user
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body

  try {
    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' })
    }

    // Check if this is the first user - make them admin
    const userCount = await User.countDocuments()
    const userRole = userCount === 0 ? 'admin' : (role || 'staff')

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: userRole
    })

    // Create token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      message: userCount === 0 
        ? 'Admin account created successfully' 
        : 'Account created successfully'
    })
  } catch (err) {
    console.error('Registration error:', err)
    res.status(500).json({ message: 'Server error during registration' })
  }
})

// POST - Login user
router.post('/login', async (req, res) => {
  const { email, password } = req.body

  try {
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' })
    }

    // Check if user exists
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    // Create token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      message: 'Login successful'
    })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ message: 'Server error during login' })
  }
})

// GET - Verify token (optional - for checking if user is still logged in)
router.get('/verify', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' })
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(verified.id).select('-password')
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' })
    }

    res.json({ user })
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' })
  }
})

module.exports = router
