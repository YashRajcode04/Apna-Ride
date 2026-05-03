import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    car: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Car',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    pickupDate: {
      type: Date,
      required: [true, 'Please provide pickup date'],
    },
    returnDate: {
      type: Date,
      required: [true, 'Please provide return date'],
    },
    totalDays: {
      type: Number,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['card', 'cash', 'online'],
      default: 'online',
    },
    paymentProvider: {
      type: String,
      enum: ['razorpay', 'none'],
      default: 'none',
    },
    paymentOrderId: {
      type: String,
      default: '',
    },
    paymentId: {
      type: String,
      default: '',
    },
    paymentSignature: {
      type: String,
      default: '',
    },
    paidAt: {
      type: Date,
    },
    notes: {
      type: String,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

// Validate that return date is after pickup date
bookingSchema.pre('save', function (next) {
  if (this.returnDate <= this.pickupDate) {
    return next(new Error('Return date must be after pickup date'));
  }
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
