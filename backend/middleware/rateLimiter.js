import rateLimit from 'express-rate-limit';

const isLocalIp = (ip = '') => {
  return (
    ip === '127.0.0.1' ||
    ip === '::1' ||
    ip === '::ffff:127.0.0.1' ||
    ip.startsWith('192.168.') ||
    ip.startsWith('10.') ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(ip)
  );
};

const skipForLocalDev = (req) => {
  const isDevelopment = process.env.NODE_ENV !== 'production';
  if (!isDevelopment) return false;
  return isLocalIp(req.ip);
};

// ===== GENERAL API RATE LIMITER =====
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipForLocalDev,
});

// ===== AUTH RATE LIMITER (Stricter for login/register) =====
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts per window
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again after 15 minutes.',
  },
  skipSuccessfulRequests: true, // Don't count successful requests
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipForLocalDev,
});

// ===== OTP REQUEST RATE LIMITER =====
export const otpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 OTP requests per hour
  message: {
    success: false,
    message: 'Too many OTP requests. Please try again after 1 hour.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipForLocalDev,
});

// ===== PASSWORD RESET RATE LIMITER =====
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 password reset attempts per hour
  message: {
    success: false,
    message: 'Too many password reset requests. Please try again after 1 hour.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipForLocalDev,
});

// ===== EMAIL VERIFICATION RESEND LIMITER =====
export const emailVerificationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 resend attempts per hour
  message: {
    success: false,
    message: 'Too many verification emails sent. Please try again after 1 hour.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipForLocalDev,
});
