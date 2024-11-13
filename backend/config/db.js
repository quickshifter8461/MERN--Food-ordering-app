const mongoose = require("mongoose");
require("dotenv").config();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

const connectDB = async () => {
  try {
    const response = await mongoose.connect(MONGODB_URI);
    console.log("DB connect successfully");
  } catch (error) {
    console.log(error);
  }
};

module.exports = { PORT, connectDB };