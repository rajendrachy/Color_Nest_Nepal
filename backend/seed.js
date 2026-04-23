require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Paint = require('./models/Paint');
const Warehouse = require('./models/Warehouse');
const { PROVINCES, DISTRICTS } = require('./config/constants');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany();
    await Paint.deleteMany();
    await Warehouse.deleteMany();

    // Create Admin User
    await User.create({
      name: 'Admin ColorNest',
      email: 'chyrajendra32@gmail.com',
      phone: '9800000000',
      password: 'Admin@123',
      role: 'admin'
    });

    // Create Sample Paints
    const paints = [
      {
        name: 'ColorNest Weatherbond',
        category: 'Exterior',
        pricePerLiter: 1200,
        availableQuantity: 100,
        description: 'Ultimate protection for exterior walls',
        specifications: { finish: 'Satin', coverage: '120 sq ft/L' },
        images: ['https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=500']
      },
      {
        name: 'ColorNest Satin Glo',
        category: 'Interior',
        pricePerLiter: 950,
        availableQuantity: 50,
        description: 'Luxurious finish for interior walls',
        specifications: { finish: 'Satin', coverage: '140 sq ft/L' },
        images: ['https://images.unsplash.com/photo-1562663474-6cbb3fee1c77?q=80&w=500']
      },
      // Add more as needed
    ];
    await Paint.insertMany(paints);

    // Create Warehouses
    await Warehouse.create({
      name: 'Kathmandu Central Warehouse',
      province: 'Bagmati Province',
      district: 'Kathmandu',
      coordinates: { lat: 27.7172, lng: 85.3240 },
      deliveryZones: [
        { province: 'Bagmati Province', districts: DISTRICTS['Bagmati Province'], deliveryCharge: 100, estimatedDays: 2 },
        { province: 'Gandaki Province', districts: DISTRICTS['Gandaki Province'], deliveryCharge: 200, estimatedDays: 4 }
      ],
      manager: 'Rajesh Hamal',
      contact: '9841234567'
    });

    console.log('Data Seeded Successfully!');
    process.exit();
  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
};

seedData();
