import express from 'express';
import {
  createBooking,
  createBookingPaymentOrder,
  getMyBookings,
  getBooking,
  updateBooking,
  cancelBooking,
  getAllBookings,
  verifyBookingPayment,
} from '../controllers/bookingController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/').post(protect, createBooking).get(protect, authorize('admin'), getAllBookings);

router.get('/my-bookings', protect, getMyBookings);

router.post('/:id/payment-order', protect, createBookingPaymentOrder);
router.post('/:id/verify-payment', protect, verifyBookingPayment);

router
  .route('/:id')
  .get(protect, getBooking)
  .put(protect, updateBooking)
  .delete(protect, cancelBooking);

export default router;
