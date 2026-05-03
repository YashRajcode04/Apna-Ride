import User from '../models/User.js';
import crypto from 'crypto';
import {
  generateTokenPair,
  verifyRefreshToken,
  createAuthResponse,
  getDeviceInfo,
} from '../utils/tokenService.js';
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendOTPEmail,
  sendWelcomeEmail,
} from '../utils/emailService.js';
import {
  sendOTPviaSMS,
  checkOTPRateLimit,
  validatePhoneNumber,
} from '../utils/otpService.js';

// ========================================
// TRADITIONAL EMAIL/PASSWORD REGISTRATION
// ========================================
export const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phone,
      authProvider: 'local',
    });

    // Generate verification token
    const verificationToken = user.generateEmailVerificationToken();
    await user.save();

    // Send verification email
    try {
      await sendVerificationEmail(user, verificationToken);
    } catch (emailError) {
      console.error('Email send failed:', emailError);
    }

    // Generate tokens
    const tokens = generateTokenPair(user._id);
    const device = getDeviceInfo(req.headers['user-agent']);
    const ip = req.ip || req.connection.remoteAddress;

    user.addRefreshToken(tokens.refreshToken, device, ip);
    user.updateLoginInfo(ip, device);
    await user.save();

    res.status(201).json(
      createAuthResponse(
        user,
        tokens,
        'Registration successful! Please check your email to verify your account.'
      )
    );
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========================================
// TRADITIONAL EMAIL/PASSWORD LOGIN
// ========================================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if account is locked
    if (user.isLocked) {
      const lockTimeRemaining = Math.ceil(
        (user.lockUntil - Date.now()) / 1000 / 60
      );
      return res.status(423).json({
        success: false,
        message: `Account locked due to multiple failed login attempts. Please try again in ${lockTimeRemaining} minutes.`,
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      await user.incLoginAttempts();
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Reset login attempts on successful login
    await user.resetLoginAttempts();

    // Generate tokens
    const tokens = generateTokenPair(user._id);
    const device = getDeviceInfo(req.headers['user-agent']);
    const ip = req.ip || req.connection.remoteAddress;

    user.addRefreshToken(tokens.refreshToken, device, ip);
    user.updateLoginInfo(ip, device);
    await user.save();

    res.json(createAuthResponse(user, tokens, 'Login successful!'));
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========================================
// PHONE/OTP REQUEST
// ========================================
export const requestOTP = async (req, res) => {
  try {
    const { phone, method = 'sms' } = req.body;

    // Validation
    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a phone number',
      });
    }

    if (!validatePhoneNumber(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid phone number with country code',
      });
    }

    // Find or create user
    let user = await User.findOne({ phone });

    if (!user) {
      // Create new user for phone login
      user = await User.create({
        phone,
        name: `User_${phone.slice(-4)}`,
        authProvider: 'phone',
      });
    }

    // Check rate limit
    const rateLimitCheck = checkOTPRateLimit(user);
    if (!rateLimitCheck.allowed) {
      return res.status(429).json({
        success: false,
        message: rateLimitCheck.message,
      });
    }

    // Generate and save OTP
    const otp = user.generateOTP();
    await user.save();

    // Send OTP
    try {
      if (method === 'sms') {
        await sendOTPviaSMS(phone, otp);
      } else if (method === 'email' && user.email) {
        await sendOTPEmail(user, otp);
      }

      res.json({
        success: true,
        message: `OTP sent successfully via ${method}`,
        expiresIn: 10 * 60, // 10 minutes in seconds
      });
    } catch (sendError) {
      console.error('OTP send error:', sendError);
      res.status(500).json({
        success: false,
        message: 'Failed to send OTP. Please try again.',
      });
    }
  } catch (error) {
    console.error('Request OTP error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========================================
// PHONE/OTP VERIFY & LOGIN
// ========================================
export const verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    // Validation
    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide phone number and OTP',
      });
    }

    // Find user
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Verify OTP
    const isValid = user.verifyOTP(otp);
    if (!isValid) {
      user.otp.attempts += 1;
      await user.save();

      return res.status(401).json({
        success: false,
        message: 'Invalid or expired OTP',
        attemptsRemaining: 3 - user.otp.attempts,
      });
    }

    // Clear OTP
    user.otp = undefined;
    user.isVerified = true;

    // Generate tokens
    const tokens = generateTokenPair(user._id);
    const device = getDeviceInfo(req.headers['user-agent']);
    const ip = req.ip || req.connection.remoteAddress;

    user.addRefreshToken(tokens.refreshToken, device, ip);
    user.updateLoginInfo(ip, device);
    await user.save();

    res.json(createAuthResponse(user, tokens, 'OTP verified! Login successful.'));
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========================================
// EMAIL VERIFICATION
// ========================================
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    // Hash the token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with this token
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token',
      });
    }

    // Update user
    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save();

    // Send welcome email
    try {
      await sendWelcomeEmail(user);
    } catch (emailError) {
      console.error('Welcome email error:', emailError);
    }

    res.json({
      success: true,
      message: 'Email verified successfully! You can now access all features.',
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========================================
// RESEND VERIFICATION EMAIL
// ========================================
export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email already verified',
      });
    }

    // Generate new token
    const verificationToken = user.generateEmailVerificationToken();
    await user.save();

    // Send email
    await sendVerificationEmail(user, verificationToken);

    res.json({
      success: true,
      message: 'Verification email sent! Please check your inbox.',
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========================================
// FORGOT PASSWORD
// ========================================
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists
      return res.json({
        success: true,
        message: 'If an account exists with this email, a reset link has been sent.',
      });
    }

    // Generate reset token
    const resetToken = user.generateResetPasswordToken();
    await user.save();

    // Send email
    try {
      await sendPasswordResetEmail(user, resetToken);
    } catch (emailError) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      throw emailError;
    }

    res.json({
      success: true,
      message: 'Password reset link sent to your email',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Email could not be sent' });
  }
};

// ========================================
// RESET PASSWORD
// ========================================
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    // Hash token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token',
      });
    }

    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    user.refreshTokens = []; // Logout from all devices
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successful! Please login with your new password.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Continue in next part...
