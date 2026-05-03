import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import passport from 'passport';
import connectDB from './config/db.js';
import carRoutes from './routes/carRoutes.js';
import userRoutes from './routes/userRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import { apiLimiter } from './middleware/rateLimiter.js';

// Load Passport config
import './config/passport.js';

dotenv.config();

const app = express();

// Trust first proxy so req.ip resolves to the client IP when behind reverse proxies.
app.set('trust proxy', 1);

const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

// ========================================
// SECURITY MIDDLEWARE
// ========================================
// Set security headers
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for development
  crossOriginEmbedderPolicy: false,
}));

// Prevent NoSQL injection
app.use(mongoSanitize());

// Prevent HTTP Parameter Pollution
app.use(hpp());

// Enable CORS
app.use(cors({
  origin: (origin, callback) => {
    // Allow same-origin/non-browser requests (no origin header)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('CORS not allowed for this origin'));
  },
  credentials: true,
}));

// Rate limiting for all API routes
app.use('/api', apiLimiter);

// ========================================
// BODY PARSER MIDDLEWARE
// ========================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ========================================
// PASSPORT INITIALIZATION
// ========================================
app.use(passport.initialize());

// ========================================
// ROUTES
// ========================================
app.use('/api/auth', authRoutes);  // New comprehensive auth routes
app.use('/api/cars', carRoutes);
app.use('/api/users', userRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Car Rental API is running...' });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Not found handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB before accepting traffic
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
