import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Car from './models/Car.js';

dotenv.config();

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI;
    console.log('🔗 Connecting to MongoDB...');
    console.log('URI:', mongoURI.substring(0, 40) + '...');
    
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
      socketTimeoutMS: 15000,
      retryWrites: true,
      w: 'majority'
    });
    console.log('✅ MongoDB Connected Successfully!');
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.error('\n⚠️  Troubleshooting tips:');
    console.error('1. Verify MongoDB Atlas IP whitelist includes your IP or 0.0.0.0/0');
    console.error('2. Check your internet connection');
    console.error('3. Verify credentials in .env file');
    process.exit(1);
  }
};

const addSampleCars = async () => {
  try {
    await connectDB();

    // Clear existing cars
    await Car.deleteMany({});
    console.log('Cleared existing cars');

    const sampleCars = [
      {
        name: 'Toyota Fortuner',
        brand: 'Toyota',
        type: 'SUV',
        category: 'Indian Cars',
        year: 2023,
        model: 'Fortuner 4x4',
        seats: 7,
        fuelType: 'Diesel',
        transmission: 'Automatic',
        pricePerDay: 5000,
        location: 'Mumbai',
        description: 'Premium 7-seater SUV perfect for family trips',
        isAvailable: true,
        isApproved: true,
        images: [{ url: 'https://via.placeholder.com/400?text=Toyota+Fortuner', public_id: 'fortuner' }],
        features: ['AC', 'Power Steering', 'ABS', 'Airbags'],
      },
      {
        name: 'Honda City',
        brand: 'Honda',
        type: 'Sedan',
        category: 'Indian Cars',
        year: 2023,
        model: 'City ZX',
        seats: 5,
        fuelType: 'Petrol',
        transmission: 'CVT',
        pricePerDay: 2500,
        location: 'Bangalore',
        description: 'Fuel-efficient sedan for comfortable city drives',
        isAvailable: true,
        isApproved: true,
        images: [{ url: 'https://via.placeholder.com/400?text=Honda+City', public_id: 'city' }],
        features: ['AC', 'Power Steering', 'ABS'],
      },
      {
        name: 'BMW 3 Series',
        brand: 'BMW',
        type: 'Luxury Sedan',
        category: 'Luxury Cars',
        year: 2023,
        model: '330i',
        seats: 5,
        fuelType: 'Petrol',
        transmission: 'Automatic',
        pricePerDay: 8500,
        location: 'Delhi',
        description: 'Ultimate luxury and performance',
        isAvailable: true,
        isApproved: true,
        images: [{ url: 'https://via.placeholder.com/400?text=BMW+3+Series', public_id: 'bmw' }],
        features: ['Leather Seats', 'Moon Roof', 'Climate Control'],
      },
      {
        name: 'Hyundai Creta',
        brand: 'Hyundai',
        type: 'Compact SUV',
        category: 'Indian Cars',
        year: 2023,
        model: 'SX(O)',
        seats: 5,
        fuelType: 'Diesel',
        transmission: 'Manual',
        pricePerDay: 3200,
        location: 'Hyderabad',
        description: 'Spacious compact SUV with excellent features',
        isAvailable: true,
        isApproved: true,
        images: [{ url: 'https://via.placeholder.com/400?text=Hyundai+Creta', public_id: 'creta' }],
        features: ['AC', 'Power Steering', 'Rear Camera'],
      },
      {
        name: 'Maruti Swift',
        brand: 'Maruti',
        type: 'Hatchback',
        category: 'Indian Cars',
        year: 2022,
        model: 'VXi',
        seats: 5,
        fuelType: 'Petrol',
        transmission: 'Manual',
        pricePerDay: 1800,
        location: 'Pune',
        description: 'Affordable and reliable hatchback',
        isAvailable: true,
        isApproved: true,
        images: [{ url: 'https://via.placeholder.com/400?text=Maruti+Swift', public_id: 'swift' }],
        features: ['AC', 'Power Steering', 'ABS'],
      },
      {
        name: 'Mercedes C-Class',
        brand: 'Mercedes',
        type: 'Luxury Sedan',
        category: 'Luxury Cars',
        year: 2023,
        model: 'C200',
        seats: 5,
        fuelType: 'Petrol',
        transmission: 'Automatic',
        pricePerDay: 12000,
        location: 'Mumbai',
        description: 'Pure luxury with German engineering',
        isAvailable: true,
        isApproved: true,
        images: [{ url: 'https://via.placeholder.com/400?text=Mercedes+C-Class', public_id: 'mercedes' }],
        features: ['Full Leather', 'Panoramic Roof', 'Premium Sound'],
      },
      {
        name: 'Mahindra XUV500',
        brand: 'Mahindra',
        type: 'SUV',
        category: 'Indian Cars',
        year: 2022,
        model: 'W9',
        seats: 5,
        fuelType: 'Diesel',
        transmission: 'Automatic',
        pricePerDay: 4200,
        location: 'Chennai',
        description: 'Powerful SUV with premium features',
        isAvailable: true,
        isApproved: true,
        images: [{ url: 'https://via.placeholder.com/400?text=Mahindra+XUV', public_id: 'xuv' }],
        features: ['Touchscreen', 'Sunroof', 'Stability Control'],
      },
      {
        name: 'Tata Nexon',
        brand: 'Tata',
        type: 'Compact SUV',
        category: 'Indian Cars',
        year: 2023,
        model: 'XE+',
        seats: 5,
        fuelType: 'Petrol',
        transmission: 'Manual',
        pricePerDay: 2200,
        location: 'Kolkata',
        description: 'Stylish and affordable compact SUV',
        isAvailable: true,
        isApproved: true,
        images: [{ url: 'https://via.placeholder.com/400?text=Tata+Nexon', public_id: 'nexon' }],
        features: ['AC', 'Power Windows', 'ABS'],
      },
    ];

    const createdCars = await Car.insertMany(sampleCars);
    console.log(`✅ Added ${createdCars.length} sample cars!`);
    console.log('Cars:', createdCars.map(c => c.name).join(', '));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding cars:', error.message);
    process.exit(1);
  }
};

// Run with async IIFE
(async () => {
  await addSampleCars();
})();
