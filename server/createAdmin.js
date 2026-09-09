const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./src/models/User');

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // 1. Create or update admin@auraestate.com
    let admin = await User.findOne({ email: 'admin@auraestate.com' });
    if (!admin) {
      admin = new User({
        name: 'Super Admin',
        email: 'admin@auraestate.com',
        password: 'password123',
        role: 'super_admin',
        phone: '+61 400 000 000',
        isVerified: true,
        isActive: true,
      });
      await admin.save();
      console.log('✅ Created new Admin account: admin@auraestate.com');
    } else {
      admin.password = 'password123';
      admin.role = 'super_admin';
      admin.isActive = true;
      admin.isVerified = true;
      await admin.save();
      console.log('✅ Updated existing admin account: admin@auraestate.com');
    }

    // 2. Also ensure admin@realestate.com has password123
    let admin2 = await User.findOne({ email: 'admin@realestate.com' });
    if (admin2) {
      admin2.password = 'password123';
      admin2.role = 'super_admin';
      await admin2.save();
      console.log('✅ Verified password for admin@realestate.com');
    }

    process.exit(0);
  } catch (err) {
    console.error('Error creating admin:', err);
    process.exit(1);
  }
}

createAdmin();
