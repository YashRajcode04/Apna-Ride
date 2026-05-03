import Booking from '../models/Booking.js';

// Simulated payment processing
export const createPaymentOrder = async (req, res) => {
  try {
    const { bookingId, amount } = req.body;

    if (!bookingId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID and amount are required',
      });
    }

    // Find the booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Simulate Razorpay Order Creation
    const fakeOrderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Save order ID to booking
    booking.paymentOrderId = fakeOrderId;
    booking.paymentMethod = 'card';
    booking.paymentProvider = 'razorpay';
    await booking.save();

    // Return fake Razorpay response
    res.status(200).json({
      success: true,
      order: {
        id: fakeOrderId,
        entity: 'order',
        amount: amount * 100, // Razorpay uses paise
        amount_paid: 0,
        amount_due: amount * 100,
        currency: 'INR',
        receipt: `booking_${bookingId}`,
        offer_id: null,
        status: 'created',
        attempts: 0,
        notes: {
          booking_id: bookingId,
          user_id: booking.user.toString(),
        },
        created_at: Math.floor(Date.now() / 1000),
      },
      key: process.env.RAZORPAY_KEY_ID || 'rzp_test_demo_key_12345',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating payment order',
      error: error.message,
    });
  }
};

// Simulate payment verification
export const verifyPayment = async (req, res) => {
  try {
    const { bookingId, paymentId, orderId, signature } = req.body;

    if (!bookingId || !paymentId || !orderId) {
      return res.status(400).json({
        success: false,
        message: 'Payment details are required',
      });
    }

    // Find the booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Simulate payment verification (success by default, fail only if test card)
    const isTestFailCard = paymentId.includes('fail');

    if (isTestFailCard) {
      return res.status(400).json({
        success: false,
        message: 'Payment failed. Please try again with a valid card.',
        bookingId,
      });
    }

    // Update booking with payment details
    booking.paymentId = paymentId;
    booking.paymentSignature = signature || `sig_${Date.now()}`;
    booking.paymentStatus = 'paid';
    booking.status = 'confirmed'; // Auto-confirm booking after payment
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      booking: {
        id: booking._id,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        totalPrice: booking.totalPrice,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verifying payment',
      error: error.message,
    });
  }
};

// Test payment endpoint (simulate different scenarios)
export const testPayment = async (req, res) => {
  try {
    const { amount, cardType = 'success' } = req.body;

    // Simulate different card types
    let fakePaymentId;
    let success = true;
    let message = 'Payment successful';

    switch (cardType) {
      case 'fail':
        fakePaymentId = `pay_fail_${Date.now()}`;
        success = false;
        message = 'Card declined. Please try another card.';
        break;
      case 'decline':
        fakePaymentId = `pay_decline_${Date.now()}`;
        success = false;
        message = 'Your card was declined. Please contact your bank.';
        break;
      case 'timeout':
        // Simulate timeout
        setTimeout(() => {
          res.status(408).json({
            success: false,
            message: 'Payment request timeout',
          });
        }, 3000);
        return;
      default:
        fakePaymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    res.status(success ? 200 : 400).json({
      success,
      message,
      paymentId: fakePaymentId,
      amount,
      orderId: `order_${Date.now()}`,
      signature: `sig_${Date.now()}`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error processing test payment',
      error: error.message,
    });
  }
};
