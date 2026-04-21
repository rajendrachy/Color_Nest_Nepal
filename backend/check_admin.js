require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const checkAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const admin = await User.findOne({ email: 'admin@colornest.com' });
    if (admin) {
      console.log('Admin user found:', admin.email);
      console.log('Role:', admin.role);
    } else {
      console.log('Admin user NOT found');
    }
    process.exit();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkAdmin();
