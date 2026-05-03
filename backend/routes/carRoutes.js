import express from 'express';
import {
  getCars,
  getCar,
  createCar,
  updateCar,
  deleteCar,
  getMyCars,
  getIndianCars,
  getLuxuryCars,
  listYourCar,
  getAllCarsAdmin,
  approveCar,
} from '../controllers/carController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getCars);
router.get('/indian', getIndianCars);
router.get('/luxury', getLuxuryCars);

// Protected routes
router.get('/my-cars', protect, getMyCars);
router.post('/list-your-car', protect, listYourCar);
router.post('/', protect, authorize('owner', 'admin'), createCar);

// Admin routes
router.get('/admin/all', protect, authorize('admin'), getAllCarsAdmin);
router.put('/:id/approve', protect, authorize('admin'), approveCar);

// Single car CRUD
router
  .route('/:id')
  .get(getCar)
  .put(protect, authorize('owner', 'admin'), updateCar)
  .delete(protect, authorize('owner', 'admin'), deleteCar);

export default router;
