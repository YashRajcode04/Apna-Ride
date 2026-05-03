import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const mongoURI = process.env.MONGO_URI;
await mongoose.connect(mongoURI);

const db = mongoose.connection;
console.log('📊 DATABASE STATISTICS');
console.log('====================');

const usersCount = await db.collection('users').countDocuments();
const carsCount = await db.collection('cars').countDocuments();
const bookingsCount = await db.collection('bookings').countDocuments();

console.log('👥 Users:', usersCount);
console.log('🚗 Cars:', carsCount);
console.log('📅 Bookings:', bookingsCount);

// Show admin user
const admin = await db.collection('users').findOne({ role: 'admin' });
console.log('\n✅ Admin User:', admin?.email || 'Not found');

// Show sample cars
const cars = await db.collection('cars').find().limit(3).toArray();
console.log('\n🚗 Sample Cars:');
cars.forEach((car, i) => {
  console.log(`  ${i+1}. ${car.name} - ₹${car.pricePerDay}/day`);
});

await mongoose.connection.close();
process.exit(0);
