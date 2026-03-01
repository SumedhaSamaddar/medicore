require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

/* ================= MIDDLEWARE ================= */
app.use(cors({
  origin: '*', // you can restrict later
  credentials: true
}));
app.use(express.json());

/* ================= HEALTH CHECK ================= */
app.get('/', (req, res) => {
  res.send('MedicoRe API Running 🚀');
});

/* ================= DATABASE ================= */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

/* ================= ROUTES ================= */
app.use('/api/auth', require('./routes/auth'));
app.use('/api/patients', require('./routes/patients'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/doctors', require('./routes/doctors'));
app.use('/api/medicines', require('./routes/medicines'));
app.use('/api/invoices', require('./routes/invoices'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/emergency', require('./routes/emergency'));

/* 🔥 AI ROUTE — IMPORTANT */
app.use('/api/ai', require('./routes/ai'));

/* ================= 404 HANDLER ================= */
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

/* ================= SERVER ================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});