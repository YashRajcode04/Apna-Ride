import User from '../models/User.js';
import {
  generateTokenPair,
  verifyRefreshToken,
  createAuthResponse,
  getDeviceInfo,
} from '../utils/tokenService.js';

// ========================================
// CHANGE PASSWORD (Authenticated)
// ========================================
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters',
      });
    }

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');

    // Verify current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    // Update password
    user.password = newPassword;
    user.refreshTokens = []; // Logout from all devices
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully! Please login again.',
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========================================
// REFRESH ACCESS TOKEN
// ========================================
export const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required',
      });
    }

    // Verify refresh token
    const verification = verifyRefreshToken(refreshToken);
    if (!verification.valid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token',
      });
    }

    // Find user and check if token exists
    const user = await User.findById(verification.decoded.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const tokenExists = user.refreshTokens.some((rt) => rt.token === refreshToken);
    if (!tokenExists) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token not found or revoked',
      });
    }

    // Generate new token pair
    const tokens = generateTokenPair(user._id);

    // Replace old refresh token with new one
    user.removeRefreshToken(refreshToken);
    const device = getDeviceInfo(req.headers['user-agent']);
    const ip = req.ip || req.connection.remoteAddress;
    user.addRefreshToken(tokens.refreshToken, device, ip);
    await user.save();

    res.json({
      success: true,
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========================================
// LOGOUT (Current Session)
// ========================================
export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      const user = await User.findById(req.user._id);
      user.removeRefreshToken(refreshToken);
      await user.save();
    }

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========================================
// LOGOUT FROM ALL DEVICES
// ========================================
export const logoutAllDevices = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.refreshTokens = [];
    await user.save();

    res.json({
      success: true,
      message: 'Logged out from all devices successfully',
    });
  } catch (error) {
    console.error('Logout all error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========================================
// GET CURRENT USER PROFILE
// ========================================
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified,
        avatar: user.avatar,
        authProvider: user.authProvider,
        licenseNumber: user.licenseNumber,
        socialAccounts: {
          google: user.socialAccounts?.google?.connected || false,
          github: user.socialAccounts?.github?.connected || false,
          facebook: user.socialAccounts?.facebook?.connected || false,
          apple: user.socialAccounts?.apple?.connected || false,
          linkedin: user.socialAccounts?.linkedin?.connected || false,
        },
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========================================
// UPDATE USER PROFILE
// ========================================
export const updateProfile = async (req, res) => {
  try {
    const { name, phone, licenseNumber } = req.body;

    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (licenseNumber) user.licenseNumber = licenseNumber;

    await user.save();

    const profileData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isVerified: user.isVerified,
      avatar: user.avatar,
      authProvider: user.authProvider,
      licenseNumber: user.licenseNumber,
    };

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: profileData,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========================================
// GET ACTIVE SESSIONS
// ========================================
export const getActiveSessions = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const sessions = user.refreshTokens.map((rt) => ({
      device: rt.device,
      ip: rt.ip,
      createdAt: rt.createdAt,
      expiresAt: rt.expiresAt,
    }));

    res.json({
      success: true,
      data: {
        sessions,
        lastLoginAt: user.lastLoginAt,
        lastLoginDevice: user.lastLoginDevice,
        lastLoginIp: user.lastLoginIp,
      },
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========================================
// GOOGLE OAUTH CALLBACK
// ========================================
export const googleCallback = async (req, res) => {
  try {
    // User is attached by Passport
    const user = req.user;

    // Generate tokens
    const tokens = generateTokenPair(user._id);
    const device = getDeviceInfo(req.headers['user-agent']);
    const ip = req.ip || req.connection.remoteAddress;

    user.addRefreshToken(tokens.refreshToken, device, ip);
    user.updateLoginInfo(ip, device);
    await user.save();

    // Redirect to frontend with tokens
    const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`;
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Google callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
  }
};

// ========================================
// GITHUB OAUTH CALLBACK
// ========================================
export const githubCallback = async (req, res) => {
  try {
    const user = req.user;

    const tokens = generateTokenPair(user._id);
    const device = getDeviceInfo(req.headers['user-agent']);
    const ip = req.ip || req.connection.remoteAddress;

    user.addRefreshToken(tokens.refreshToken, device, ip);
    user.updateLoginInfo(ip, device);
    await user.save();

    const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`;
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('GitHub callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
  }
};

// ========================================
// FACEBOOK OAUTH CALLBACK
// ========================================
export const facebookCallback = async (req, res) => {
  try {
    const user = req.user;

    const tokens = generateTokenPair(user._id);
    const device = getDeviceInfo(req.headers['user-agent']);
    const ip = req.ip || req.connection.remoteAddress;

    user.addRefreshToken(tokens.refreshToken, device, ip);
    user.updateLoginInfo(ip, device);
    await user.save();

    const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`;
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Facebook callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
  }
};
