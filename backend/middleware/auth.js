import User from '../models/User.js';
import { verifyAccessToken } from '../utils/tokenService.js';

// ===== PROTECT ROUTES - Verify JWT Token =====
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const verification = verifyAccessToken(token);
      
      if (!verification.valid) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized, token expired or invalid',
          error: verification.error,
        });
      }

      // Get user from token
      req.user = await User.findById(verification.decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not found',
        });
      }

      next();
    } catch (error) {
      console.error('Auth error:', error);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed',
      });
    }
  } else {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided',
    });
  }
};

// ===== AUTHORIZE BY ROLE =====
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`,
      });
    }
    next();
  };
};

// ===== VERIFY EMAIL REQUIRED =====
export const verifyEmailRequired = (req, res, next) => {
  if (!req.user.isVerified) {
    return res.status(403).json({
      success: false,
      message: 'Please verify your email to access this feature',
    });
  }
  next();
};

// ===== OPTIONAL AUTH (doesn't fail if no token) =====
export const optionalAuth = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const verification = verifyAccessToken(token);
      
      if (verification.valid) {
        req.user = await User.findById(verification.decoded.id).select('-password');
      }
    } catch (error) {
      // Silent fail - continue without authenticated user context
    }
  }
  
  next();
};
