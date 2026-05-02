const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`⚠️  MongoDB Connection Warning: ${err.message}`);
    console.log('💡 Tip: Ensure MongoDB is running or update MONGODB_URI in .env');
    // We don't exit here so the server can still start for other routes/testing
  }
};

module.exports = connectDB;
