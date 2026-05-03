import mongoose from 'mongoose';

const carSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide car name'],
      trim: true,
    },
    brand: {
      type: String,
      required: [true, 'Please provide car brand'],
    },
    model: {
      type: String,
      required: [true, 'Please provide car model'],
    },
    year: {
      type: Number,
      required: [true, 'Please provide car year'],
    },
    type: {
      type: String,
      enum: ['Sedan', 'SUV', 'Hatchback', 'Convertible', 'Coupe', 'Wagon', 'Van', 'MUV', 'Pickup'],
      required: [true, 'Please provide car type'],
    },
    category: {
      type: String,
      enum: ['Indian', 'Luxury', 'Economy', 'Premium'],
      default: 'Indian',
    },
    seats: {
      type: Number,
      required: [true, 'Please provide number of seats'],
      min: 2,
      max: 15,
    },
    fuelType: {
      type: String,
      enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid'],
      required: [true, 'Please provide fuel type'],
    },
    transmission: {
      type: String,
      enum: ['Manual', 'Automatic', 'Semi-Automatic'],
      required: [true, 'Please provide transmission type'],
    },
    pricePerDay: {
      type: Number,
      required: [true, 'Please provide price per day'],
      min: 0,
    },
    location: {
      type: String,
      required: [true, 'Please provide location'],
    },
    description: {
      type: String,
      maxlength: 1000,
    },
    features: [String],
    images: [
      {
        url: String,
        public_id: String,
      },
    ],
    isAvailable: {
      type: Boolean,
      default: true,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for search functionality
carSchema.index({ name: 'text', brand: 'text', model: 'text', location: 'text' });
carSchema.index({ category: 1 });
carSchema.index({ brand: 1 });
carSchema.index({ fuelType: 1 });
carSchema.index({ transmission: 1 });
carSchema.index({ pricePerDay: 1 });

const Car = mongoose.model('Car', carSchema);

export default Car;
