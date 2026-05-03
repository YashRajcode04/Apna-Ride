const showcaseCars = [
  {
    _id: 'showcase-urus',
    name: 'Lamborghini Urus Performante',
    brand: 'Lamborghini',
    model: 'Urus Performante',
    year: 2024,
    type: 'SUV',
    category: 'Luxury',
    seats: 5,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    pricePerDay: 38999,
    location: 'Mumbai',
    description: 'Track-inspired SUV with aggressive handling, bold design, and an unmistakable V8 soundtrack for high-impact arrivals.',
    features: ['ADAPTIVE SUSPENSION', 'AWD', 'DUAL-ZONE CLIMATE', 'PREMIUM AUDIO', 'PANORAMIC CAMERA'],
    images: [{ url: '/lambo.png' }],
    isAvailable: true,
    isApproved: true,
    rating: 4.9,
    numReviews: 87,
  },
  {
    _id: 'showcase-911',
    name: 'Porsche 911 Carrera S',
    brand: 'Porsche',
    model: '911 Carrera S',
    year: 2023,
    type: 'Coupe',
    category: 'Luxury',
    seats: 4,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    pricePerDay: 34999,
    location: 'Delhi',
    description: 'Iconic rear-engine coupe delivering precision steering, elite dynamics, and timeless design for special drives.',
    features: ['SPORT CHRONO', 'BOSE AUDIO', 'LEATHER CABIN', 'ADAPTIVE HEADLIGHTS', 'PARK ASSIST'],
    images: [{ url: '/poster.png' }],
    isAvailable: true,
    isApproved: true,
    rating: 4.8,
    numReviews: 64,
  },
  {
    _id: 'showcase-rangerover',
    name: 'Range Rover Autobiography',
    brand: 'Land Rover',
    model: 'Range Rover Autobiography',
    year: 2024,
    type: 'SUV',
    category: 'Premium',
    seats: 5,
    fuelType: 'Hybrid',
    transmission: 'Automatic',
    pricePerDay: 26999,
    location: 'Bangalore',
    description: 'Ultra-luxury SUV with effortless highway comfort, advanced cabin tech, and commanding road presence.',
    features: ['MASSAGE SEATS', 'AIR SUSPENSION', '4-ZONE CLIMATE', 'MERIDIAN AUDIO', '360 CAMERA'],
    images: [{ url: '/banner_car_image.png' }],
    isAvailable: true,
    isApproved: true,
    rating: 4.7,
    numReviews: 52,
  },
  {
    _id: 'showcase-bmw7',
    name: 'BMW 740Li M Sport',
    brand: 'BMW',
    model: '740Li',
    year: 2023,
    type: 'Sedan',
    category: 'Premium',
    seats: 5,
    fuelType: 'Diesel',
    transmission: 'Automatic',
    pricePerDay: 18999,
    location: 'Pune',
    description: 'Executive limousine with refined rear-seat comfort, premium materials, and dynamic driving balance.',
    features: ['VENTILATED SEATS', 'REAR ENTERTAINMENT', 'HUD', 'SOFT CLOSE DOORS', 'ADAPTIVE CRUISE'],
    images: [{ url: '/main_car.png' }],
    isAvailable: true,
    isApproved: true,
    rating: 4.6,
    numReviews: 41,
  },
  {
    _id: 'showcase-mercedes',
    name: 'Mercedes-Benz E 300',
    brand: 'Mercedes-Benz',
    model: 'E 300',
    year: 2022,
    type: 'Sedan',
    category: 'Premium',
    seats: 5,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    pricePerDay: 14999,
    location: 'Hyderabad',
    description: 'Sophisticated sedan engineered for business travel, city comfort, and quiet luxury.',
    features: ['AMBIENT LIGHTING', 'BURMESTER AUDIO', 'ADAS', 'WIRELESS CHARGING', 'PANORAMIC SUNROOF'],
    images: [{ url: '/poster2.jpg' }],
    isAvailable: true,
    isApproved: true,
    rating: 4.5,
    numReviews: 39,
  },
  {
    _id: 'showcase-fortuner',
    name: 'Toyota Fortuner Legender',
    brand: 'Toyota',
    model: 'Fortuner Legender',
    year: 2023,
    type: 'SUV',
    category: 'Indian',
    seats: 7,
    fuelType: 'Diesel',
    transmission: 'Automatic',
    pricePerDay: 8999,
    location: 'Jaipur',
    description: 'Reliable full-size SUV with strong road presence, 7-seat practicality, and long-distance comfort.',
    features: ['AWD', '7 SEATS', 'DUAL AC', 'CONNECTED CAR TECH', 'REAR CAMERA'],
    images: [{ url: '/banner_car_image.png' }],
    isAvailable: true,
    isApproved: true,
    rating: 4.4,
    numReviews: 73,
  },
  {
    _id: 'showcase-virtus',
    name: 'Volkswagen Virtus GT',
    brand: 'Volkswagen',
    model: 'Virtus GT',
    year: 2024,
    type: 'Sedan',
    category: 'Economy',
    seats: 5,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    pricePerDay: 4999,
    location: 'Chennai',
    description: 'Sharp and efficient sedan with a spirited turbo engine, ideal for city use and intercity drives.',
    features: ['CRUISE CONTROL', 'VENTILATED SEATS', 'AUTO CLIMATE', 'LED HEADLAMPS', 'WIRELESS CARPLAY'],
    images: [{ url: '/main_car.png' }],
    isAvailable: true,
    isApproved: true,
    rating: 4.3,
    numReviews: 58,
  },
  {
    _id: 'showcase-baleno',
    name: 'Maruti Baleno Alpha',
    brand: 'Maruti Suzuki',
    model: 'Baleno Alpha',
    year: 2022,
    type: 'Hatchback',
    category: 'Economy',
    seats: 5,
    fuelType: 'Petrol',
    transmission: 'Manual',
    pricePerDay: 2499,
    location: 'Kolkata',
    description: 'Efficient city hatchback with excellent mileage and practical cabin comfort for everyday rentals.',
    features: ['TOUCH INFOTAINMENT', 'AUTO AC', 'REAR CAMERA', 'KEYLESS ENTRY', 'ABS + AIRBAGS'],
    images: [{ url: '/poster.png' }],
    isAvailable: true,
    isApproved: true,
    rating: 4.2,
    numReviews: 91,
  },
];

const matchesCategoryGroup = (car, categoryGroup) => {
  if (!categoryGroup) return true;

  const price = car.pricePerDay || 0;

  // Pure price-based categorization: > 8000 is luxury, <= 8000 is eco
  if (categoryGroup === 'eco') {
    return price <= 8000;
  }

  if (categoryGroup === 'luxury') {
    return price > 8000;
  }

  return true;
};

export const getMergedCars = (apiCars = [], options = {}) => {
  const { categoryGroup = null } = options;
  
  // Filter both showcase and API cars by categoryGroup (price-based)
  const filteredApiCars = apiCars.filter((car) => matchesCategoryGroup(car, categoryGroup));
  const sourceCars = showcaseCars.filter((car) => matchesCategoryGroup(car, categoryGroup));

  const keyFor = (car) =>
    `${(car.brand || '').toLowerCase()}-${(car.model || car.name || '').toLowerCase()}-${car.year || ''}`;

  const existingKeys = new Set(filteredApiCars.map(keyFor));
  const extras = sourceCars.filter((car) => !existingKeys.has(keyFor(car)));

  return [...filteredApiCars, ...extras];
};

export const getShowcaseCarById = (id) => showcaseCars.find((car) => car._id === id) || null;

export default showcaseCars;
