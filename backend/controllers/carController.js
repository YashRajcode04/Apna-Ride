import Car from '../models/Car.js';
import mongoose from 'mongoose';

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);
const escapeRegex = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// @desc    Get all cars with advanced filters
// @route   GET /api/cars
// @access  Public
export const getCars = async (req, res) => {
  try {
    const {
      location,
      type,
      category,
      brand,
      model,
      fuelType,
      transmission,
      seats,
      minPrice,
      maxPrice,
      search,
      sort,
      page = 1,
      limit = 12,
    } = req.query;

    let query = {};
    const safePage = Math.max(Number(page) || 1, 1);
    const safeLimit = Math.min(Math.max(Number(limit) || 12, 1), 50);

    // Location filter (case-insensitive regex)
    if (location) {
      query.location = { $regex: escapeRegex(location), $options: 'i' };
    }

    // Car type filter
    if (type) {
      query.type = type;
    }

    // Category filter (Indian, Luxury, Economy, Premium)
    if (category) {
      query.category = category;
    }

    // Brand filter (case-insensitive)
    if (brand) {
      query.brand = { $regex: `^${brand}$`, $options: 'i' };
    }

    // Model filter (case-insensitive)
    if (model) {
      query.model = { $regex: escapeRegex(model), $options: 'i' };
    }

    // Fuel type filter
    if (fuelType) {
      query.fuelType = fuelType;
    }

    // Transmission filter
    if (transmission) {
      query.transmission = transmission;
    }

    // Seats filter
    if (seats) {
      query.seats = Number(seats);
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.pricePerDay = {};
      if (minPrice) query.pricePerDay.$gte = Number(minPrice);
      if (maxPrice) query.pricePerDay.$lte = Number(maxPrice);
    }

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Only show approved and available cars to public
    query.isApproved = true;

    // Sorting
    let sortOption = { createdAt: -1 };
    if (sort === 'price_low') sortOption = { pricePerDay: 1 };
    if (sort === 'price_high') sortOption = { pricePerDay: -1 };
    if (sort === 'rating') sortOption = { rating: -1 };
    if (sort === 'newest') sortOption = { createdAt: -1 };

    // Pagination
    const skip = (safePage - 1) * safeLimit;
    const total = await Car.countDocuments(query);

    const cars = await Car.find(query)
      .populate('owner', 'name email phone')
      .sort(sortOption)
      .skip(skip)
      .limit(safeLimit);

    res.json({
      success: true,
      count: cars.length,
      total,
      page: safePage,
      pages: Math.ceil(total / safeLimit),
      data: cars,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Indian cars
// @route   GET /api/cars/indian
// @access  Public
export const getIndianCars = async (req, res) => {
  try {
    const cars = await Car.find({ category: 'Indian', isApproved: true, isAvailable: true })
      .populate('owner', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: cars.length,
      data: cars,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Luxury cars
// @route   GET /api/cars/luxury
// @access  Public
export const getLuxuryCars = async (req, res) => {
  try {
    const cars = await Car.find({ category: 'Luxury', isApproved: true, isAvailable: true })
      .populate('owner', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: cars.length,
      data: cars,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single car
// @route   GET /api/cars/:id
// @access  Public
export const getCar = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid car id' });
    }

    const car = await Car.findById(req.params.id).populate('owner', 'name email phone');

    if (!car) {
      return res.status(404).json({ success: false, message: 'Car not found' });
    }

    res.json({
      success: true,
      data: car,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new car
// @route   POST /api/cars
// @access  Private/Owner
export const createCar = async (req, res) => {
  try {
    const carData = {
      ...req.body,
      owner: req.user._id,
    };

    // Admin-created cars are auto-approved
    if (req.user.role === 'admin') {
      carData.isApproved = true;
    }

    const car = await Car.create(carData);

    res.status(201).json({
      success: true,
      data: car,
      message:
        req.user.role === 'admin'
          ? 'Car added successfully'
          : 'Car submitted for approval. It will be listed once approved by admin.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    List your car (owner submission)
// @route   POST /api/cars/list-your-car
// @access  Private
export const listYourCar = async (req, res) => {
  try {
    const {
      name,
      brand,
      model,
      year,
      type,
      category,
      seats,
      fuelType,
      transmission,
      pricePerDay,
      location,
      description,
      features,
      images,
    } = req.body;

    // Validation
    if (!name || !brand || !model || !year || !type || !pricePerDay || !location) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, brand, model, year, type, pricePerDay, location',
      });
    }

    const car = await Car.create({
      name,
      brand,
      model,
      year,
      type,
      category: category || 'Indian',
      seats: seats || 5,
      fuelType: fuelType || 'Petrol',
      transmission: transmission || 'Manual',
      pricePerDay,
      location,
      description,
      features,
      images,
      owner: req.user._id,
      isApproved: false, // Requires admin approval
    });

    res.status(201).json({
      success: true,
      data: car,
      message: 'Your car has been submitted for review. It will be listed once approved by admin.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update car
// @route   PUT /api/cars/:id
// @access  Private/Owner
export const updateCar = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid car id' });
    }

    let car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({ success: false, message: 'Car not found' });
    }

    // Check if user is car owner
    if (car.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const allowedFields = [
      'name',
      'brand',
      'model',
      'year',
      'type',
      'category',
      'seats',
      'fuelType',
      'transmission',
      'pricePerDay',
      'location',
      'description',
      'features',
      'images',
      'isAvailable',
    ];

    const adminOnlyFields = ['isApproved', 'rating', 'numReviews'];
    const effectiveAllowedFields = req.user.role === 'admin'
      ? [...allowedFields, ...adminOnlyFields]
      : allowedFields;

    const updatePayload = {};
    Object.keys(req.body || {}).forEach((key) => {
      if (effectiveAllowedFields.includes(key)) {
        updatePayload[key] = req.body[key];
      }
    });

    car = await Car.findByIdAndUpdate(req.params.id, updatePayload, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      data: car,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete car
// @route   DELETE /api/cars/:id
// @access  Private/Owner
export const deleteCar = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid car id' });
    }

    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({ success: false, message: 'Car not found' });
    }

    // Check if user is car owner
    if (car.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    await car.deleteOne();

    res.json({
      success: true,
      message: 'Car removed',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's cars
// @route   GET /api/cars/my-cars
// @access  Private
export const getMyCars = async (req, res) => {
  try {
    const cars = await Car.find({ owner: req.user._id });

    res.json({
      success: true,
      count: cars.length,
      data: cars,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all cars (Admin - includes unapproved)
// @route   GET /api/cars/admin/all
// @access  Private/Admin
export const getAllCarsAdmin = async (req, res) => {
  try {
    const { isApproved, category } = req.query;
    let query = {};

    if (isApproved !== undefined) {
      query.isApproved = isApproved === 'true';
    }
    if (category) {
      query.category = category;
    }

    const cars = await Car.find(query)
      .populate('owner', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: cars.length,
      data: cars,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve or reject a car listing
// @route   PUT /api/cars/:id/approve
// @access  Private/Admin
export const approveCar = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid car id' });
    }

    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({ success: false, message: 'Car not found' });
    }

    car.isApproved = req.body.isApproved !== undefined ? req.body.isApproved : true;
    await car.save();

    res.json({
      success: true,
      data: car,
      message: car.isApproved ? 'Car listing approved' : 'Car listing rejected',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
