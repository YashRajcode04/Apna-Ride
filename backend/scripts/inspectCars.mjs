import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Car from '../models/Car.js';

dotenv.config();

const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI;
if (!mongoURI) {
  console.error('Missing MONGO_URI / MONGODB_URI');
  process.exit(1);
}

await mongoose.connect(mongoURI);

const cars = await Car.find({}).select('name category isApproved isAvailable images pricePerDay').lean();

const totals = {
  total: cars.length,
  approved: cars.filter((c) => c.isApproved).length,
  available: cars.filter((c) => c.isAvailable).length,
};

const groupBy = (items, keyFn) => {
  const map = new Map();
  for (const item of items) {
    const key = keyFn(item);
    map.set(key, (map.get(key) || 0) + 1);
  }
  return Object.fromEntries([...map.entries()].sort((a, b) => String(a[0]).localeCompare(String(b[0]))));
};

const byCategory = groupBy(cars, (c) => c.category ?? '(missing)');
const byCategoryNormalized = groupBy(cars, (c) => String(c.category ?? '').trim().toLowerCase() || '(missing)');

const sampleIssues = cars
  .filter((c) => {
    const raw = c.category;
    const norm = String(raw ?? '').trim();
    return raw && norm !== raw;
  })
  .slice(0, 10)
  .map((c) => ({ id: c._id, name: c.name, category: c.category }));

const sampleImages = cars.slice(0, 10).map((c) => {
  const first = Array.isArray(c.images) && c.images.length ? c.images[0] : null;
  let url = null;
  if (typeof first === 'string') url = first;
  if (first && typeof first === 'object') url = first.url;
  return { name: c.name, category: c.category, imageUrl: url };
});

console.log(JSON.stringify({ totals, byCategory, byCategoryNormalized, sampleIssues, sampleImages }, null, 2));

await mongoose.disconnect();
