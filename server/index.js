/**
 * ============================================================
 * Golden River Perfume — Express Backend (Clean Version)
 * ============================================================
 */
require('dotenv').config();

const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');
const connectDB  = require('./config/db');

// Route Imports
const contactRoutes = require('./routes/contact');
const orderRoutes   = require('./routes/order');

const app  = express();
const PORT = process.env.PORT || 5001;

// ─── Database Connection ─────────────────────────
connectDB();

// ─── Middleware ──────────────────────────────────
app.set('trust proxy', 1);
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// 🔥 Ignore React hot-update errors (for development)
app.use((req, res, next) => {
  if (req.url.includes('hot-update')) {
    return res.status(204).end();
  }
  next();
});

// ─── CORS Configuration ──────────────────────────
app.use(cors({
  origin: true, // Allow all origins for easier local testing
  credentials: true,
}));

// ─── API Routes ──────────────────────────────────
app.get('/', (req, res) => {
  res.json({ success: true, message: 'Golden River API is running 🚀' });
});

app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'Healthy' });
});

app.use('/api/contact', contactRoutes);
app.use('/api/order', orderRoutes);

// ─── Error Handling ──────────────────────────────

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err.message);
  res.status(500).json({ 
    success: false, 
    message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message 
  });
});

// ─── Start Server ────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;