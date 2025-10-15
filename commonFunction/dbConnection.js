const mongoose = require("mongoose");

const connectDb = async (mongoUri) => {
  try {
    await mongoose.connect(mongoUri, {
    
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000, 
      socketTimeoutMS: 45000, 
    });
    console.log(" MongoDB connected successfully.");
  } catch (error) {
    console.error(" MongoDB connection failed:", error.message);
    process.exit(1); 
  }
};

module.exports = { connectDb };
