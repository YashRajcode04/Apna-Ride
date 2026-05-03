import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// ===== GENERATE ACCESS TOKEN (Short-lived) =====
export const generateAccessToken = (userId) => {
  return jwt.sign(
    { id: userId, type: 'access' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRE || '15m' }
  );
};

// ===== GENERATE REFRESH TOKEN (Long-lived) =====
export const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d' }
  );
};

// ===== GENERATE TOKEN PAIR =====
export const generateTokenPair = (userId) => {
  return {
    accessToken: generateAccessToken(userId),
    refreshToken: generateRefreshToken(userId),
  };
};

// ===== VERIFY ACCESS TOKEN =====
export const verifyAccessToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== 'access') {
      throw new Error('Invalid token type');
    }
    return { valid: true, decoded };
  } catch (error) {
    return { valid: false, error: error.message };
  }
};

// ===== VERIFY REFRESH TOKEN =====
export const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
    );
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }
    return { valid: true, decoded };
  } catch (error) {
    return { valid: false, error: error.message };
  }
};

// ===== LEGACY: Generate single token (for backward compatibility) =====
export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// ===== GENERATE SECURE RANDOM TOKEN =====
export const generateSecureToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// ===== HASH TOKEN =====
export const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

// ===== DECODE TOKEN WITHOUT VERIFICATION (for debugging) =====
export const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
};

// ===== GET DEVICE INFO FROM USER AGENT =====
export const getDeviceInfo = (userAgent) => {
  if (!userAgent) return 'Unknown Device';
  
  if (userAgent.includes('Mobile')) return 'Mobile';
  if (userAgent.includes('Tablet')) return 'Tablet';
  if (userAgent.includes('Windows')) return 'Windows PC';
  if (userAgent.includes('Macintosh')) return 'Mac';
  if (userAgent.includes('Linux')) return 'Linux';
  
  return 'Unknown Device';
};

// ===== CREATE RESPONSE WITH TOKENS =====
export const createAuthResponse = (user, tokens, message = 'Success') => {
  return {
    success: true,
    message,
    data: {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified,
        avatar: user.avatar,
        authProvider: user.authProvider,
        socialAccounts: {
          google: user.socialAccounts?.google?.connected || false,
          github: user.socialAccounts?.github?.connected || false,
          facebook: user.socialAccounts?.facebook?.connected || false,
          apple: user.socialAccounts?.apple?.connected || false,
          linkedin: user.socialAccounts?.linkedin?.connected || false,
        },
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    },
  };
};
