import User from '../models/User.js';
import Car from '../models/Car.js';
import Booking from '../models/Booking.js';

// ========================================
// ADMIN DASHBOARD STATS
// ========================================

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalCars, totalBookings, pendingCars, pendingBookings, recentUsers, recentBookings] =
      await Promise.all([
        User.countDocuments(),
        Car.countDocuments({ isApproved: true }),
        Booking.countDocuments(),
        Car.countDocuments({ isApproved: false }),
        Booking.countDocuments({ status: 'pending' }),
        User.find().sort({ createdAt: -1 }).limit(5).select('name email role createdAt'),
        Booking.find()
          .sort({ createdAt: -1 })
          .limit(5)
          .populate('user', 'name email')
          .populate('car', 'name brand'),
      ]);

    // Revenue stats
    const completedBookings = await Booking.find({ status: 'completed' });
    const totalRevenue = completedBookings.reduce((acc, b) => acc + b.totalPrice, 0);

    // Category-wise car count
    const carsByCategory = await Car.aggregate([
      { $match: { isApproved: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    // Booking status breakdown
    const bookingsByStatus = await Booking.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalCars,
        totalBookings,
        pendingCars,
        pendingBookings,
        totalRevenue,
        carsByCategory,
        bookingsByStatus,
        recentUsers,
        recentBookings,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========================================
// USER MANAGEMENT
// ========================================

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    let query = {};

    if (role) {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await User.countDocuments(query);

    const users = await User.find(query)
      .select('-password -refreshTokens -otp')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      count: users.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: users,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single user by ID
// @route   GET /api/admin/users/:id
// @access  Private/Admin
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -refreshTokens -otp');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Also get user's cars and bookings count
    const [carsCount, bookingsCount] = await Promise.all([
      Car.countDocuments({ owner: user._id }),
      Booking.countDocuments({ user: user._id }),
    ]);

    res.json({
      success: true,
      data: {
        ...user.toObject(),
        carsCount,
        bookingsCount,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!['user', 'owner', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be user, owner, or admin',
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Prevent admin from changing their own role
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own role',
      });
    }

    user.role = role;
    await user.save();

    res.json({
      success: true,
      data: user,
      message: `User role updated to ${role}`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account from admin panel',
      });
    }

    // Delete user's cars and bookings
    await Car.deleteMany({ owner: user._id });
    await Booking.deleteMany({ user: user._id });
    await user.deleteOne();

    res.json({
      success: true,
      message: 'User and associated data deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========================================
// BOOKING MANAGEMENT
// ========================================

// @desc    Get all bookings (admin)
// @route   GET /api/admin/bookings
// @access  Private/Admin
export const getAdminBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    let query = {};

    if (status) {
      query.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Booking.countDocuments(query);

    const bookings = await Booking.find(query)
      .populate('car', 'name brand model pricePerDay images')
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      count: bookings.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update booking status (admin)
// @route   PUT /api/admin/bookings/:id/status
// @access  Private/Admin
export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be pending, confirmed, cancelled, or completed',
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    booking.status = status;
    await booking.save();

    // Make car available again if cancelled or completed
    if (status === 'cancelled' || status === 'completed') {
      const car = await Car.findById(booking.car);
      if (car) {
        car.isAvailable = true;
        await car.save();
      }
    }

    // Make car unavailable if confirmed
    if (status === 'confirmed') {
      const car = await Car.findById(booking.car);
      if (car) {
        car.isAvailable = false;
        await car.save();
      }
    }

    res.json({
      success: true,
      data: booking,
      message: `Booking status updated to ${status}`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete booking (admin)
// @route   DELETE /api/admin/bookings/:id
// @access  Private/Admin
export const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Make car available again
    const car = await Car.findById(booking.car);
    if (car) {
      car.isAvailable = true;
      await car.save();
    }

    await booking.deleteOne();

    res.json({
      success: true,
      message: 'Booking deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
