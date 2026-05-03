import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Car from '../models/Car.js';
import User from '../models/User.js';

dotenv.config();

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI;
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected for seeding');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing data
    await Car.deleteMany({});
    await User.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@apnaride.com',
      phone: '+919876543210',
      password: 'Admin@123',
      role: 'admin',
      isVerified: true,
      isApproved: true,
    });
    console.log('✓ Admin user created:', adminUser.email);

    // Create owner users
    const owner1 = await User.create({
      name: 'John Dealer',
      email: 'john@example.com',
      phone: '+919876543211',
      password: 'Owner@123',
      role: 'owner',
      isVerified: true,
      isApproved: true,
    });

    const owner2 = await User.create({
      name: 'Sarah Motors',
      email: 'sarah@example.com',
      phone: '+919876543212',
      password: 'Owner@123',
      role: 'owner',
      isVerified: true,
      isApproved: true,
    });
    console.log('✓ Owner users created');

    // Create regular users
    const user1 = await User.create({
      name: 'Raj Kumar',
      email: 'raj@example.com',
      phone: '+919876543213',
      password: 'User@123',
      role: 'user',
      isVerified: true,
      isApproved: true,
    });

    const user2 = await User.create({
      name: 'Priya Singh',
      email: 'priya@example.com',
      phone: '+919876543214',
      password: 'User@123',
      role: 'user',
      isVerified: true,
      isApproved: true,
    });
    console.log('✓ Regular users created');

    // Sample car data with local image URLs and categories
    const sampleCars = [
      {
        name: 'Maruti Swift',
        brand: 'Maruti',
        type: 'Hatchback',
        year: 2022,
        model: 'VXi',
        seats: 5,
        fuelType: 'Petrol',
        transmission: 'Manual',
        category: 'Economy',
        pricePerDay: 1800,
        location: 'Pune',
        description: 'Affordable and reliable hatchback for city commuting. Great fuel efficiency.',
        isAvailable: true,
        isApproved: true,
        owner: owner1._id,
        images: [
          { url: '/swift.jpg', public_id: 'swift-1' }
        ],
        features: ['AC', 'Power Steering', 'ABS'],
        rules: ['Budget option', 'Use responsibly', 'Return on time'],
      },
      {
        name: 'Maruti Baleno',
        brand: 'Maruti',
        type: 'Hatchback',
        year: 2023,
        model: 'Baleno Zeta',
        seats: 5,
        fuelType: 'Petrol',
        transmission: 'Automatic',
        category: 'Economy',
        pricePerDay: 2800,
        location: 'Pune',
        description: 'Premium hatchback with excellent mileage and modern features. Eco-friendly drive.',
        isAvailable: true,
        isApproved: true,
        owner: owner2._id,
        images: [
          { url: '/baleno/baleno.jpg', public_id: 'baleno-1' }
        ],
        features: ['AC', 'Power Steering', 'Power Windows', 'ABS', 'Touchscreen'],
        rules: ['No smoking', 'Gentle driving required', 'Return on time'],
      },
      {
        name: 'Honda City',
        brand: 'Honda',
        type: 'Sedan',
        year: 2023,
        model: 'City ZX',
        seats: 5,
        fuelType: 'Petrol',
        transmission: 'Automatic',
        category: 'Economy',
        pricePerDay: 2500,
        location: 'Bangalore',
        description: 'Fuel-efficient sedan for comfortable city drives. Excellent mileage and comfort.',
        isAvailable: true,
        isApproved: true,
        owner: owner1._id,
        images: [
          { url: '/honda/honda city.jpg', public_id: 'honda-1' }
        ],
        features: ['AC', 'Power Steering', 'Power Windows', 'ABS', 'Airbags'],
        rules: ['No smoking', 'Return with full tank'],
      },
      {
        name: 'Tata Nexon',
        brand: 'Tata',
        type: 'SUV',
        year: 2023,
        model: 'XE+',
        seats: 5,
        fuelType: 'Petrol',
        transmission: 'Manual',
        category: 'Economy',
        pricePerDay: 2200,
        location: 'Kolkata',
        description: 'Stylish and affordable compact SUV for everyday use. Budget-friendly with great features.',
        isAvailable: true,
        isApproved: true,
        owner: owner2._id,
        images: [
          { url: '/nexon/nexon.jpg', public_id: 'nexon-1' }
        ],
        features: ['AC', 'Power Windows', 'ABS', 'Touchscreen'],
        rules: ['Student friendly', 'Budget option', 'No long distance'],
      },
      {
        name: 'Toyota Fortuner',
        brand: 'Toyota',
        type: 'SUV',
        year: 2023,
        model: 'Fortuner 4x4',
        seats: 7,
        fuelType: 'Diesel',
        transmission: 'Automatic',
        category: 'Economy',
        pricePerDay: 5000,
        location: 'Mumbai',
        description: 'Premium 7-seater SUV perfect for family trips and off-road adventures.',
        isAvailable: true,
        isApproved: true,
        owner: owner1._id,
        images: [
          { url: '/fortuner_hero.png', public_id: 'fortuner-1' }
        ],
        features: ['AC', 'Power Steering', 'Power Windows', 'ABS', 'Airbags', 'Navigation System'],
        rules: ['No smoking', 'No pets', 'Return fuel as given'],
      },
      {
        name: 'Hyundai Creta',
        brand: 'Hyundai',
        type: 'SUV',
        year: 2023,
        model: 'SX(O)',
        seats: 5,
        fuelType: 'Diesel',
        transmission: 'Manual',
        category: 'Economy',
        pricePerDay: 3200,
        location: 'Hyderabad',
        description: 'Spacious compact SUV with excellent ground clearance.',
        isAvailable: true,
        isApproved: true,
        owner: owner2._id,
        images: [
          { url: '/creta.jpg', public_id: 'creta-1' }
        ],
        features: ['AC', 'Power Steering', 'ABS', 'Airbags', 'Rear Camera'],
        rules: ['No smoking', 'No pets', 'Maximum km limit 500/day'],
      },
      {
        name: 'BMW 7 Series',
        brand: 'BMW',
        type: 'Sedan',
        year: 2023,
        model: '740 Li',
        seats: 5,
        fuelType: 'Petrol',
        transmission: 'Automatic',
        category: 'Luxury',
        pricePerDay: 8500,
        location: 'Delhi',
        description: 'Ultimate luxury and performance. Perfect for premium experiences.',
        isAvailable: true,
        isApproved: true,
        owner: owner2._id,
        images: [
          { url: '/bmw740_real.jpg', public_id: 'bmw-1' }
        ],
        features: ['Leather Seats', 'Moon Roof', 'Navigation', 'Bluetooth', 'Climate Control', 'Lane Assist'],
        rules: ['No smoking', 'Maintain speed limits', 'Return with full tank'],
      },
      {
        name: 'Mercedes E-Class',
        brand: 'Mercedes',
        type: 'Sedan',
        year: 2023,
        model: 'E 300',
        seats: 5,
        fuelType: 'Petrol',
        transmission: 'Automatic',
        category: 'Luxury',
        pricePerDay: 14000,
        location: 'Mumbai',
        description: 'Premium luxury sedan with cutting-edge technology and supreme comfort.',
        isAvailable: true,
        isApproved: true,
        owner: owner2._id,
        images: [
          { url: '/mercedes_real.jpg', public_id: 'mercedes-1' }
        ],
        features: ['Full Leather', 'Panoramic Roof', 'Premium Sound', 'Ambient Lighting', 'Air Suspension'],
        rules: ['Treated with care', 'Valet parking only', 'Clean driving record required'],
      },
      {
        name: 'Volkswagen Virtus',
        brand: 'Volkswagen',
        type: 'Sedan',
        year: 2023,
        model: 'GT Plus',
        seats: 5,
        fuelType: 'Petrol',
        transmission: 'Automatic',
        category: 'Premium',
        pricePerDay: 3500,
        location: 'Delhi',
        description: 'German engineering meets Indian affordability. Premium sedan with modern features.',
        isAvailable: true,
        isApproved: true,
        owner: owner1._id,
        images: [
          { url: '/virtus_real.jpg', public_id: 'virtus-1' }
        ],
        features: ['Touchscreen', 'Climate Control', 'ABS', 'Power Windows', 'Rear Camera'],
        rules: ['No smoking', 'Return with full tank', 'Gentle driving required'],
      },
      {
        name: 'Range Rover Sport',
        brand: 'Land Rover',
        type: 'SUV',
        year: 2023,
        model: 'Sport',
        seats: 5,
        fuelType: 'Petrol',
        transmission: 'Automatic',
        category: 'Luxury',
        pricePerDay: 15000,
        location: 'Bangalore',
        description: 'Premium luxury SUV with superior off-road capabilities and cutting-edge technology.',
        isAvailable: true,
        isApproved: true,
        owner: owner2._id,
        images: [
          { url: '/rangerover_real.jpg', public_id: 'rangerover-1' }
        ],
        features: ['Full Leather', 'Panoramic Sunroof', 'Premium Sound System', 'Climate Control', 'Off-road Mode', 'Navigation'],
        rules: ['Treated with care', 'Valet parking only', 'Clean driving record required', 'No extreme off-roading'],
      },
      {
        name: 'Lamborghini Urus',
        brand: 'Lamborghini',
        type: 'SUV',
        year: 2023,
        model: 'Urus',
        seats: 5,
        fuelType: 'Petrol',
        transmission: 'Automatic',
        category: 'Luxury',
        pricePerDay: 25000,
        location: 'Delhi',
        description: 'Supercar SUV combining jaw-dropping performance with practical functionality. Extreme luxury on wheels.',
        isAvailable: true,
        isApproved: true,
        owner: owner1._id,
        images: [
          { url: '/urus_real.jpg', public_id: 'urus-1' }
        ],
        features: ['Full Leather', 'Panoramic Roof', 'Advanced Navigation', 'Premium Sound System', 'Air Suspension', 'Sport Mode'],
        rules: ['Expert drivers only', 'Maximum 300km per day', 'Valet parking only', 'Full tank required'],
      },
      {
        name: 'Porsche 911',
        brand: 'Porsche',
        type: 'Coupe',
        year: 2023,
        model: 'Carrera',
        seats: 4,
        fuelType: 'Petrol',
        transmission: 'Automatic',
        category: 'Luxury',
        pricePerDay: 22000,
        location: 'Mumbai',
        description: 'Iconic sports car with unmatched performance and precision engineering. Pure driving excitement.',
        isAvailable: true,
        isApproved: true,
        owner: owner2._id,
        images: [
          { url: '/porsche_real.jpg', public_id: 'porsche-1' }
        ],
        features: ['Full Leather', 'Satellite Navigation', 'Bose Sound System', 'Climate Control', 'Heated Seats'],
        rules: ['Professional drivers only', 'Maximum 200km per day', 'Highway driving restricted', 'Full insurance required'],
      },
    ];

    // Insert cars
    const createdCars = await Car.insertMany(sampleCars);
    console.log(`✓ ${createdCars.length} sample cars created with proper image URLs`);

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📝 Test Credentials:');
    console.log('Admin:');
    console.log('  Email: admin@apnaride.com');
    console.log('  Password: Admin@123');
    console.log('\nOwner:');
    console.log('  Email: john@example.com');
    console.log('  Password: Owner@123');
    console.log('\nUser:');
    console.log('  Email: raj@example.com');
    console.log('  Password: User@123');

    process.exit(0);
  } catch (error) {
    console.error('🔴 Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
