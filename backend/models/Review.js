import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
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
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a rating'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, 'Please provide a comment'],
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure one review per user per car
reviewSchema.index({ car: 1, user: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);

export default Review;
