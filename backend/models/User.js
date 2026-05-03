import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true,
    },
    email: {
      type: String,
      required: function() {
        // Email not required if user signs up via phone/OTP
        return !this.phone || this.authProvider !== 'phone';
      },
      unique: true,
      sparse: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      required: function() {
        // Password not required for social/OTP logins
        return this.authProvider === 'local';
      },
      minlength: 6,
      select: false,
    },
    phone: {
      type: String,
      sparse: true,
      unique: true,
    },
    avatar: {
      url: String,
      public_id: String,
    },
    role: {
      type: String,
      enum: ['user', 'owner', 'admin'],
      default: 'user',
    },
    
    // ===== EMAIL VERIFICATION =====
    isVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    emailVerificationExpire: Date,
    
    // ===== PASSWORD RESET =====
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    
    // ===== OAUTH PROVIDERS =====
    authProvider: {
      type: String,
      enum: ['local', 'google', 'github', 'facebook', 'apple', 'linkedin', 'phone'],
      default: 'local',
    },
    socialAccounts: {
      google: {
        id: String,
        email: String,
        connected: { type: Boolean, default: false },
      },
      github: {
        id: String,
        username: String,
        connected: { type: Boolean, default: false },
      },
      facebook: {
        id: String,
        email: String,
        connected: { type: Boolean, default: false },
      },
      apple: {
        id: String,
        email: String,
        connected: { type: Boolean, default: false },
      },
      linkedin: {
        id: String,
        email: String,
        connected: { type: Boolean, default: false },
      },
    },
    
    // ===== OTP FOR PHONE LOGIN =====
    otp: {
      code: String,
      expiresAt: Date,
      attempts: { type: Number, default: 0 },
      lastSentAt: Date,
    },
    
    // ===== SECURITY =====
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: Date,
    
    // ===== SESSION MANAGEMENT =====
    refreshTokens: [{
      token: String,
      device: String,
      ip: String,
      createdAt: { type: Date, default: Date.now },
      expiresAt: Date,
    }],
    
    // ===== AUDIT LOG =====
    lastLoginAt: Date,
    lastLoginIp: String,
    lastLoginDevice: String,
    
    licenseNumber: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// ===== VIRTUAL FOR ACCOUNT LOCK STATUS =====
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// ===== MIDDLEWARE: Hash password before saving =====
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  if (!this.password) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  return next();
});

// ===== METHOD: Compare password =====
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ===== METHOD: Increment login attempts =====
userSchema.methods.incLoginAttempts = function() {
  // Reset attempts if lock has expired
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  const maxAttempts = 5;
  const lockTime = 2 * 60 * 60 * 1000; // 2 hours
  
  // Lock account after max attempts
  if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + lockTime };
  }
  
  return this.updateOne(updates);
};

// ===== METHOD: Reset login attempts =====
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $set: { loginAttempts: 0 },
    $unset: { lockUntil: 1 }
  });
};

// ===== METHOD: Generate email verification token =====
userSchema.methods.generateEmailVerificationToken = function() {
  const verificationToken = crypto.randomBytes(32).toString('hex');
  
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
  
  this.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  
  return verificationToken;
};

// ===== METHOD: Generate password reset token =====
userSchema.methods.generateResetPasswordToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  this.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 hour
  
  return resetToken;
};

// ===== METHOD: Generate OTP =====
userSchema.methods.generateOTP = function() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  this.otp = {
    code: crypto.createHash('sha256').update(otp).digest('hex'),
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    attempts: 0,
    lastSentAt: Date.now(),
  };
  
  return otp;
};

// ===== METHOD: Verify OTP =====
userSchema.methods.verifyOTP = function(enteredOTP) {
  if (!this.otp || !this.otp.code) {
    return false;
  }
  
  // Check expiration
  if (this.otp.expiresAt < Date.now()) {
    return false;
  }
  
  // Check attempts
  if (this.otp.attempts >= 3) {
    return false;
  }
  
  const hashedOTP = crypto.createHash('sha256').update(enteredOTP).digest('hex');
  return hashedOTP === this.otp.code;
};

// ===== METHOD: Add refresh token =====
userSchema.methods.addRefreshToken = function(token, device, ip) {
  this.refreshTokens.push({
    token,
    device,
    ip,
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
  });
  
  // Keep only last 5 sessions
  if (this.refreshTokens.length > 5) {
    this.refreshTokens = this.refreshTokens.slice(-5);
  }
};

// ===== METHOD: Remove refresh token =====
userSchema.methods.removeRefreshToken = function(token) {
  this.refreshTokens = this.refreshTokens.filter(rt => rt.token !== token);
};

// ===== METHOD: Update login info =====
userSchema.methods.updateLoginInfo = function(ip, device) {
  this.lastLoginAt = Date.now();
  this.lastLoginIp = ip;
  this.lastLoginDevice = device;
};

const User = mongoose.model('User', userSchema);

export default User;
