import express from 'express';
import {
  createReview,
  getCarReviews,
  updateReview,
  deleteReview,
} from '../controllers/reviewController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/').post(protect, createReview);

router.get('/car/:carId', getCarReviews);

router.route('/:id').put(protect, updateReview).delete(protect, deleteReview);

export default router;
