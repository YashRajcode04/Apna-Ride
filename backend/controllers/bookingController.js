import Booking from '../models/Booking.js';
import Car from '../models/Car.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import mongoose from 'mongoose';

const razorpayEnabled = Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

const razorpay = razorpayEnabled
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  : null;

const calculateBookingPricing = (pickupDate, returnDate, pricePerDay) => {
  const pickup = new Date(pickupDate);
  const returnD = new Date(returnDate);
  const totalDays = Math.ceil((returnD - pickup) / (1000 * 60 * 60 * 24));

  if (totalDays <= 0) {
    return { totalDays: 0, totalPrice: 0 };
  }

  return {
    totalDays,
    totalPrice: totalDays * pricePerDay,
  };
};

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
export const createBooking = async (req, res) => {
  try {
    const { car, pickupDate, returnDate, notes } = req.body;

    if (!car || !pickupDate || !returnDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide car, pickupDate, and returnDate',
      });
    }

    if (!isValidObjectId(car)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid car id',
      });
    }

    // Check if car exists
    const carData = await Car.findById(car);

    if (!carData) {
      return res.status(404).json({ success: false, message: 'Car not found' });
    }

    if (!carData.isAvailable) {
      return res.status(400).json({ success: false, message: 'Car is not available' });
    }

    const { totalDays, totalPrice } = calculateBookingPricing(
      pickupDate,
      returnDate,
      carData.pricePerDay
    );

    if (totalDays <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Return date must be after pickup date',
      });
    }

    const booking = await Booking.create({
      car,
      user: req.user._id,
      pickupDate,
      returnDate,
      totalDays,
      totalPrice,
      notes,
      paymentMethod: 'online',
      paymentStatus: 'pending',
      paymentProvider: 'none',
    });

    res.status(201).json({
      success: true,
      data: booking,
      message: 'Booking created. Complete payment to confirm your reservation.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create Razorpay order for booking
// @route   POST /api/bookings/:id/payment-order
// @access  Private
export const createBookingPaymentOrder = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid booking id' });
    }

    if (!razorpayEnabled || !razorpay) {
      return res.status(503).json({
        success: false,
        message: 'Payment gateway is not configured. Please add Razorpay keys in backend .env',
      });
    }

    const booking = await Booking.findById(req.params.id).populate('car');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    if (!booking.car || !booking.car.isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'This car is no longer available for booking',
      });
    }

    if (booking.status === 'cancelled' || booking.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: `Cannot create payment order for a ${booking.status} booking`,
      });
    }

    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already paid',
      });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(booking.totalPrice * 100),
      currency: 'INR',
      receipt: `booking_${booking._id}`,
      notes: {
        bookingId: booking._id.toString(),
        userId: booking.user.toString(),
        carId: booking.car._id.toString(),
      },
    });

    booking.paymentProvider = 'razorpay';
    booking.paymentOrderId = order.id;
    await booking.save();

    res.json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.RAZORPAY_KEY_ID,
        bookingId: booking._id,
        name: 'CarRental India',
        description: `Booking for ${booking.car.name}`,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify Razorpay payment and confirm booking
// @route   POST /api/bookings/:id/verify-payment
// @access  Private
export const verifyBookingPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid booking id' });
    }

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing payment verification data',
      });
    }

    const booking = await Booking.findById(req.params.id).populate('car');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    if (booking.paymentOrderId && booking.paymentOrderId !== razorpay_order_id) {
      return res.status(400).json({
        success: false,
        message: 'Order id does not match this booking',
      });
    }

    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const generatedSignatureBuffer = Buffer.from(generatedSignature, 'utf8');
    const providedSignatureBuffer = Buffer.from(razorpay_signature, 'utf8');
    const signatureValid =
      generatedSignatureBuffer.length === providedSignatureBuffer.length &&
      crypto.timingSafeEqual(generatedSignatureBuffer, providedSignatureBuffer);

    if (!signatureValid) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed',
      });
    }

    if (!booking.car || !booking.car.isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Car is no longer available. Please contact support for refund.',
      });
    }

    const reservedCar = await Car.findOneAndUpdate(
      { _id: booking.car._id, isAvailable: true },
      { $set: { isAvailable: false } },
      { new: true }
    );

    booking.paymentProvider = 'razorpay';
    booking.paymentOrderId = razorpay_order_id;
    booking.paymentId = razorpay_payment_id;
    booking.paymentSignature = razorpay_signature;
    booking.paymentStatus = 'paid';
    booking.paidAt = new Date();

    if (!reservedCar) {
      booking.status = 'pending';
      await booking.save();

      return res.status(409).json({
        success: false,
        message:
          'Payment verified but this car was just booked by another user. Please contact support for next steps.',
      });
    }

    booking.status = 'confirmed';
    await booking.save();

    res.json({
      success: true,
      message: 'Payment verified and booking confirmed',
      data: booking,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
export const getMyBookings = async (req, res) => {
  try {
    // Find cars owned by the user
    const myCars = await Car.find({ owner: req.user._id }).select('_id');
    const myCarIds = myCars.map(c => c._id);

    const bookings = await Booking.find({ 
      $or: [
        { user: req.user._id },
        { car: { $in: myCarIds } }
      ]
    })
      .populate('car')
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
export const getBooking = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid booking id' });
    }

    const booking = await Booking.findById(req.params.id)
      .populate('car')
      .populate('user', 'name email phone');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Check if user is booking owner
    if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    res.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id
// @access  Private
export const updateBooking = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid booking id' });
    }

    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Check if user is booking owner
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const allowedFieldsForUser = ['notes'];
    const allowedFieldsForAdmin = ['status', 'notes', 'pickupDate', 'returnDate'];
    const allowedFields = req.user.role === 'admin' ? allowedFieldsForAdmin : allowedFieldsForUser;

    const requestedFields = Object.keys(req.body || {});
    const disallowedFields = requestedFields.filter((field) => !allowedFields.includes(field));

    if (disallowedFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `These fields cannot be updated: ${disallowedFields.join(', ')}`,
      });
    }

    const updatePayload = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updatePayload[field] = req.body[field];
      }
    });

    if (updatePayload.pickupDate || updatePayload.returnDate) {
      const nextPickupDate = updatePayload.pickupDate || booking.pickupDate;
      const nextReturnDate = updatePayload.returnDate || booking.returnDate;

      const car = await Car.findById(booking.car);
      if (!car) {
        return res.status(404).json({ success: false, message: 'Car not found for this booking' });
      }

      const { totalDays, totalPrice } = calculateBookingPricing(nextPickupDate, nextReturnDate, car.pricePerDay);
      if (totalDays <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Return date must be after pickup date',
        });
      }

      updatePayload.totalDays = totalDays;
      updatePayload.totalPrice = totalPrice;
    }

    booking = await Booking.findByIdAndUpdate(req.params.id, updatePayload, {
      new: true,
      runValidators: true,
    });

    // If booking is completed or cancelled, make car available again
    if (booking.status === 'completed' || booking.status === 'cancelled') {
      const car = await Car.findById(booking.car);
      if (car) {
        car.isAvailable = true;
        await car.save();
      }
    }

    res.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel booking
// @route   DELETE /api/bookings/:id
// @access  Private
export const cancelBooking = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid booking id' });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Check if user is booking owner
    // Check if user is booking owner OR car owner
    const car = await Car.findById(booking.car);
    const isCarOwner = car && car.owner.toString() === req.user._id.toString();
    
    if (booking.user.toString() !== req.user._id.toString() && !isCarOwner && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to cancel this booking' });
    }

    // Make car available again
    if (car && (booking.status === 'confirmed' || booking.status === 'pending')) {
      car.isAvailable = true;
      await car.save();
    }

    await booking.deleteOne();

    res.json({
      success: true,
      message: 'Booking removed successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all bookings (Admin)
// @route   GET /api/bookings
// @access  Private/Admin
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('car')
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
