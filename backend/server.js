require('dotenv').config(); // Load environment variables

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// ========== IMPORT ALL ROUTES ==========
const patientRoutes = require('./routes/patients');
const medicineRoutes = require('./routes/medicines');
const invoiceRoutes = require('./routes/invoices');
const appointmentRoutes = require('./routes/appointments');
const analyticsRoutes = require('./routes/analytics');  // New
const aiRoutes = require('./routes/ai');                // New
const emergencyRoutes = require('./routes/emergency');  // New

const app = express();

// ========== CORS CONFIGURATION ==========
const allowedOrigins = [
  'https://medicore-2.netlify.app', // Your Netlify URL
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('Blocked origin:', origin);
      callback(new Error('CORS not allowed from this origin'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
}));

// ========== MIDDLEWARE ==========
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========== ROUTES ==========
// Health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'Medicore API is running',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    endpoints: {
      patients: '/api/patients',
      medicines: '/api/medicines',
      invoices: '/api/invoices',
      appointments: '/api/appointments',
      analytics: '/api/analytics',
      ai: '/api/ai',
      emergency: '/api/emergency'
    }
  });
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API is working!',
    origin: req.headers.origin 
  });
});

// ========== API ROUTES ==========
// Core medical routes
app.use('/api/patients', patientRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/appointments', appointmentRoutes);

// Analytics and AI routes
app.use('/api/analytics', analyticsRoutes);  // Will handle /analytics/analytics, /analytics/performance, etc.
app.use('/api/ai', aiRoutes);                 // Will handle /ai/analyze-symptoms, /ai/status, etc.
app.use('/api/emergency', emergencyRoutes);   // Will handle /emergency/hospitals, /emergency/ambulances, etc.

// ========== ERROR HANDLING ==========
// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({ 
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// ========== DATABASE CONNECTION ==========
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/medicore';
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB connected successfully');
    
    // Log all registered models
    console.log('📊 Registered Models:', Object.keys(mongoose.models).join(', '));
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    console.log('⚠️ Continuing without database connection');
  }
};

// ========== START SERVER ==========
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 CORS enabled for: ${allowedOrigins.join(', ')}`);
    console.log(`🤖 OpenAI API Key: ${process.env.OPENAI_API_KEY ? 'Present ✓' : 'Missing ✗'}`);
    
    console.log('\n📋 Registered Routes:');
    console.log('   ┌─ Core Medical Routes');
    console.log('   ├── GET/POST  /api/patients');
    console.log('   ├── GET/POST  /api/medicines');
    console.log('   ├── GET/POST  /api/invoices');
    console.log('   ├── GET/POST  /api/appointments');
    console.log('   │');
    console.log('   ├─ Analytics Routes');
    console.log('   ├── GET       /api/analytics/analytics');
    console.log('   ├── GET       /api/analytics/performance');
    console.log('   ├── GET       /api/analytics/clinics');
    console.log('   ├── POST      /api/analytics/ai-predict');
    console.log('   └── POST      /api/analytics/ai-insights');
    console.log('   │');
    console.log('   ├─ AI Symptom Checker Routes');
    console.log('   ├── POST      /api/ai/analyze-symptoms');
    console.log('   ├── POST      /api/ai/analyze-symptoms-fallback');
    console.log('   ├── GET       /api/ai/status');
    console.log('   ├── GET       /api/ai/test-openai');
    console.log('   └── GET       /api/ai/emergency-keywords');
    console.log('   │');
    console.log('   ├─ Emergency Services Routes');
    console.log('   ├── GET/POST  /api/emergency/hospitals');
    console.log('   ├── GET/POST  /api/emergency/ambulances');
    console.log('   ├── GET/POST  /api/emergency/requests');
    console.log('   ├── POST      /api/emergency/assess');
    console.log('   └── GET       /api/emergency/stats');
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, closing server...');
    server.close(() => {
      mongoose.connection.close(false).then(() => {
        process.exit(0);
      });
    });
  });

  process.on('SIGINT', () => {
    console.log('SIGINT received, closing server...');
    server.close(() => {
      mongoose.connection.close(false).then(() => {
        process.exit(0);
      });
    });
  });
}).catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});