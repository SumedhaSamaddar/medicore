require('dotenv').config(); // Load environment variables

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Import your route modules (uncomment when ready)
// const userRoutes = require('./routes/userRoutes');
// const openaiRoutes = require('./routes/openaiRoutes');

const app = express();

// ========== CORS CONFIGURATION ==========
// Allow requests from your Netlify frontend
// ========== CORS CONFIGURATION ==========
const allowedOrigins = [
  'https://medicore-2.netlify.app', // Your NEW Netlify URL
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000'
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'CORS policy does not allow access from this origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  optionsSuccessStatus: 200
}));

// ========== MIDDLEWARE ==========
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========== ROUTES ==========
// Health check route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Medicore API is running',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Test route to verify CORS is working
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'CORS is working correctly!',
    origin: req.headers.origin || 'No origin'
  });
});

// ========== API ROUTES ==========
// Mount your actual route files here (uncomment when ready)
// app.use('/api/users', userRoutes);
// app.use('/api/openai', openaiRoutes);

// ========== STATIC FILES (for production) ==========
// Only serve static files if the frontend build folder exists
const frontendBuildPath = path.join(__dirname, '../frontend/build');
const fs = require('fs');

if (fs.existsSync(frontendBuildPath)) {
  console.log('✅ Serving static files from:', frontendBuildPath);
  app.use(express.static(frontendBuildPath));
  
  // Catch-all route to serve frontend for any non-API routes
  app.get('/*', (req, res) => {
    // Don't serve index.html for API routes
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    
    const indexPath = path.join(frontendBuildPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).json({ error: 'Frontend build not found' });
    }
  });
} else {
  console.log('⚠️ Frontend build folder not found at:', frontendBuildPath);
  console.log('⚠️ API routes will work, but static files will not be served');
}

// ========== DATABASE CONNECTION ==========
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/medicore';
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    // Don't exit process, just log error
    console.log('⚠️ Continuing without database connection');
  }
};

// ========== START SERVER ==========
const PORT = process.env.PORT || 5000;

// Start server (don't wait for DB to connect)
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 CORS enabled for: ${allowedOrigins.join(', ')}`);
  console.log(`🤖 OpenAI API Key: ${process.env.OPENAI_API_KEY ? 'Present ✓' : 'Missing ✗'}`);
});

// Connect to DB after server starts
connectDB();

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  server.close(() => {
    if (mongoose.connection.readyState === 1) {
      mongoose.connection.close(false).then(() => {
        console.log('MongoDB connection closed');
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, closing server...');
  server.close(() => {
    if (mongoose.connection.readyState === 1) {
      mongoose.connection.close(false).then(() => {
        console.log('MongoDB connection closed');
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  });
});