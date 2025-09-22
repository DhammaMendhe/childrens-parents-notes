const mongoose = require("mongoose");

const MONGOURI = 'mongodb://localhost:27017/notes-app'; // Added database name

async function dbconnection() {
  try {
    // Connect to MongoDB with proper options
    await mongoose.connect(MONGOURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log("✅ Connected to MongoDB successfully...");
    
    // Connection event listeners
    mongoose.connection.on('connected', () => {
      console.log('🔗 Mongoose connected to MongoDB');
    });
    
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ Mongoose disconnected from MongoDB');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('🔄 Mongoose reconnected to MongoDB');
    });
    
    // Handle process termination
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('📴 MongoDB connection closed due to app termination');
      process.exit(0);
    });
    
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    
    // Retry connection after 5 seconds
    console.log("🔄 Retrying connection in 5 seconds...");
    setTimeout(dbconnection, 5000);
  }
}

module.exports = dbconnection;
