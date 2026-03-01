require('dotenv').config(); // Load environment variables

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Added CORS
const path = require('path');

// Import your route modules (uncomment when ready)
// const userRoutes = require('./routes/userRoutes');
// const openaiRoutes = require('./routes/openaiRoutes');

const app = express();

// ========== CORS CONFIGURATION ==========
// Allow requests from your Netlify frontend
const allowedOrigins = [
  'https://69a38e26e83754d478af317c--ephemeral-creponne-6b5b66.netlify.app',
  'http://localhost:5173', // Vite default
  'http://localhost:3000', // Create React App default
  'http://localhost:5000'  // Local backend
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
  credentials: true, // Allow cookies/auth headers
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
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

// Mount your actual route files (uncomment when ready)
// app.use('/api/users', userRoutes);
// app.use('/api/openai', openaiRoutes);

// ========== STATIC FILES (for production) ==========
// Serve static files from the frontend build folder
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Catch-all route to serve frontend for any non-API routes
app.get('*', (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

// ========== DATABASE CONNECTION ==========
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/medicore';
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
};

// ========== START SERVER ==========
const PORT = process.env.PORT || 5000; // Changed default to 5000 for consistency

// Start server only after DB is connected
connectDB().then(() => {
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 CORS enabled for: ${allowedOrigins.join(', ')}`);
    console.log(`🤖 OpenAI API Key: ${process.env.OPENAI_API_KEY ? 'Present ✓' : 'Missing ✗'}`);

    // Log registered routes
    console.log('\n📋 Registered Routes:');
    if (app._router && app._router.stack) {
      app._router.stack.forEach((layer) => {
        if (layer.route && layer.route.path) {
          console.log(`   ${Object.keys(layer.route.methods).join(', ').toUpperCase()} ${layer.route.path}`);
        }
      });
    }
  });

  // Handle graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, closing server...');
    server.close(() => {
      mongoose.connection.close(false).then(() => {
        console.log('MongoDB connection closed');
        process.exit(0);
      });
    });
  });

  process.on('SIGINT', () => {
    console.log('SIGINT received, closing server...');
    server.close(() => {
      mongoose.connection.close(false).then(() => {
        console.log('MongoDB connection closed');
        process.exit(0);
      });
    });
  });
}).catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});