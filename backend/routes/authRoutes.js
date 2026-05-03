import express from 'express';
import passport from '../config/passport.js';
import {
  register,
  login,
  requestOTP,
  verifyOTP,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';
import {
  changePassword,
  refreshAccessToken,
  logout,
  logoutAllDevices,
  getProfile,
  updateProfile,
  getActiveSessions,
  googleCallback,
  facebookCallback,
} from '../controllers/authControllerPart2.js';
import { protect, verifyEmailRequired } from '../middleware/auth.js';
import {
  authLimiter,
  otpLimiter,
  passwordResetLimiter,
  emailVerificationLimiter,
} from '../middleware/rateLimiter.js';

const router = express.Router();

// ========================================
// TRADITIONAL EMAIL/PASSWORD AUTH
// ========================================
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);

// ========================================
// PHONE/OTP AUTHENTICATION
// ========================================
router.post('/otp/request', otpLimiter, requestOTP);
router.post('/otp/verify', authLimiter, verifyOTP);

// ========================================
// EMAIL VERIFICATION
// ========================================
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', emailVerificationLimiter, resendVerification);

// ========================================
// PASSWORD MANAGEMENT
// ========================================
router.post('/forgot-password', passwordResetLimiter, forgotPassword);
router.put('/reset-password/:token', resetPassword);
router.put('/change-password', protect, changePassword);

// ========================================
// TOKEN MANAGEMENT
// ========================================
router.post('/refresh-token', refreshAccessToken);
router.post('/logout', protect, logout);
router.post('/logout-all', protect, logoutAllDevices);

// ========================================
// USER PROFILE (Protected Routes)
// ========================================
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.get('/sessions', protect, getActiveSessions);

// ========================================
// GOOGLE OAUTH
// ========================================
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);
router.get(
  '/google/callback',
  passport.authenticate('google', { 
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_failed`,
    session: false 
  }),
  googleCallback
);

// ========================================
// FACEBOOK OAUTH
// ========================================
router.get(
  '/facebook',
  passport.authenticate('facebook', { scope: ['email'] })
);
router.get(
  '/facebook/callback',
  passport.authenticate('facebook', { 
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=facebook_failed`,
    session: false 
  }),
  facebookCallback
);

// ========================================
// LINKEDIN OAUTH (Optional - if configured)
// ========================================
// Uncomment when LinkedIn OAuth is configured
// router.get('/linkedin', passport.authenticate('linkedin'));
// router.get('/linkedin/callback', passport.authenticate('linkedin'), linkedinCallback);

// ========================================
// APPLE SIGN IN (Optional - if configured)
// ========================================
// Uncomment when Apple Sign In is configured
// router.get('/apple', passport.authenticate('apple'));
// router.get('/apple/callback', passport.authenticate('apple'), appleCallback);

export default router;
