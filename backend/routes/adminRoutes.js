import express from 'express';
import {
  getDashboardStats,
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
  getAdminBookings,
  updateBookingStatus,
  deleteBooking,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All admin routes require authentication + admin role
router.use(protect);
router.use(authorize('admin'));

// Dashboard
router.get('/stats', getDashboardStats);

// User management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

// Booking management
router.get('/bookings', getAdminBookings);
router.put('/bookings/:id/status', updateBookingStatus);
router.delete('/bookings/:id', deleteBooking);

export default router;
