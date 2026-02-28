// server.js
require('dotenv').config(); // Load environment variables

const express = require('express');
const mongoose = require('mongoose');
// Import your route modules (adjust paths as needed)
// const userRoutes = require('./routes/userRoutes');
// const openaiRoutes = require('./routes/openaiRoutes');

const app = express();
const path = require('path');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========== ROUTES ==========
// Define all your routes HERE before starting the server

// Example route
app.get('/', (req, res) => {
  res.send('Medicore API is running');
});

// Mount your actual route files (uncomment and adjust)
// app.use('/api/users', userRoutes);
// app.use('/api/openai', openaiRoutes);
app.use(express.static(path.join(__dirname, '../frontend/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});
// ========== DATABASE CONNECTION ==========
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/medicore');
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1); // Exit if DB fails to connect
  }
};

// ========== START SERVER ==========
const PORT = process.env.PORT || 3000;

// Start server only after DB is connected
connectDB().then(() => {
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🤖 OpenAI API Key: ${process.env.OPENAI_API_KEY ? 'Present' : 'Missing'}`);

    // Safely log registered routes (only if _router exists)
    if (app._router && app._router.stack) {
      console.log('📋 Registered Routes:');
      app._router.stack.forEach((layer) => {
        if (layer.route && layer.route.path) {
          console.log(`   ${Object.keys(layer.route.methods).join(', ').toUpperCase()} ${layer.route.path}`);
        } else if (layer.name === 'router') { // mounted router
          console.log(`   Router: ${layer.regexp}`);
        }
      });
    } else {
      console.log('📋 No routes registered yet (app._router is undefined)');
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
}).catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});