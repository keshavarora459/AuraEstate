const mongoose = require('mongoose');
const dns = require('dns');

// Use Google & Cloudflare DNS to resolve MongoDB Atlas SRV records when on local Node
if (process.env.NODE_ENV !== 'production') {
  try {
    // dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
  } catch (dnsErr) {
    // Ignore DNS override errors in cloud containers
  }
}


let isConnecting = false;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }
  if (isConnecting) {
    return;
  }
  isConnecting = true;
  try {
    let mongoUri = process.env.MONGO_URI || 'mongodb+srv://keshavarora459_db_user:uPze3mYuAEGSqjpJ@cluster0.c8f8m4p.mongodb.net/test?appName=Cluster0';
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);
    console.log(`📦 Database: ${mongoose.connection.name}`);
    
    mongoose.set('bufferCommands', true);

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected.');
      mongoose.set('bufferCommands', false);
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected successfully');
      mongoose.set('bufferCommands', true);
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err.message);
    });

  } catch (error) {
    console.error('❌ MongoDB Connection Failed:', error.message);
    mongoose.set('bufferCommands', false);
    if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
      process.exit(1);
    } else {
      console.warn('⚠️  Server staying active so connection can be retried.');
    }
  } finally {
    isConnecting = false;
  }
};

module.exports = connectDB;
