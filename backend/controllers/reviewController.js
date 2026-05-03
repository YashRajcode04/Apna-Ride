import Review from '../models/Review.js';
import Car from '../models/Car.js';

// @desc    Create new review
// @route   POST /api/reviews
// @access  Private
export const createReview = async (req, res) => {
  try {
    const { car, rating, comment, booking } = req.body;

    // Check if car exists
    const carData = await Car.findById(car);

    if (!carData) {
      return res.status(404).json({ success: false, message: 'Car not found' });
    }

    // Check if user already reviewed this car
    const existingReview = await Review.findOne({ car, user: req.user._id });

    if (existingReview) {
      return res.status(400).json({ success: false, message: 'You already reviewed this car' });
    }

    const review = await Review.create({
      car,
      user: req.user._id,
      rating,
      comment,
      booking,
    });

    // Update car rating
    const reviews = await Review.find({ car });
    const avgRating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

    carData.rating = avgRating;
    carData.numReviews = reviews.length;
    await carData.save();

    res.status(201).json({
      success: true,
      data: review,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get car reviews
// @route   GET /api/reviews/car/:carId
// @access  Public
export const getCarReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ car: req.params.carId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
export const updateReview = async (req, res) => {
  try {
    let review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Check if user is review owner
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    review = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    // Update car rating
    const reviews = await Review.find({ car: review.car });
    const avgRating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

    const car = await Car.findById(review.car);
    car.rating = avgRating;
    await car.save();

    res.json({
      success: true,
      data: review,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Check if user is review owner
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const carId = review.car;
    await review.deleteOne();

    // Update car rating
    const reviews = await Review.find({ car: carId });
    const car = await Car.findById(carId);
    
    if (reviews.length > 0) {
      const avgRating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
      car.rating = avgRating;
    } else {
      car.rating = 0;
    }
    
    car.numReviews = reviews.length;
    await car.save();

    res.json({
      success: true,
      message: 'Review removed',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
