import express from 'express';
import { createPaymentOrder, verifyPayment, testPayment } from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Create payment order for a booking
router.post('/order', protect, createPaymentOrder);

// Verify payment
router.post('/verify', protect, verifyPayment);

// Test payment (for demo/simulation)
router.post('/test', testPayment);

export default router;
