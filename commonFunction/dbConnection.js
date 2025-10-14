const mongoose = require("mongoose");

const connectDb = async (mongoUri) => {
  try {
    await mongoose.connect(mongoUri);
    console.log(" MongoDB connected successfully.");
  } catch (error) {
    console.error(" MongoDB connection failed:", error.message);
    process.exit(1); // Exit the app if DB connection fails
  }
};

module.exports = { connectDb };
