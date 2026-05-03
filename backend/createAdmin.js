import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Update or create admin user
    let adminUser = await User.findOne({ email: 'admin@apnaride.com' });
    
    if (adminUser) {
      // Delete existing user to recreate with proper password hashing
      await User.deleteOne({ email: 'admin@apnaride.com' });
    }
    
    // Create new admin user (password will be hashed by pre-save hook)
    adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@apnaride.com',
      password: 'Admin@123',
      phone: '1234567890',
      role: 'admin',
      emailVerified: true,
      authProvider: 'local'
    });
    
    console.log('✅ Admin account created successfully!');
    console.log('Email: admin@apnaride.com');
    console.log('Password: Admin@123');
    console.log('User ID:', adminUser._id);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  }
}

createAdmin();
