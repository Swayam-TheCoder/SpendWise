const mongoose = require("mongoose");

const connectDB = async() => {
  try{
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch(err){
    process.exit(1);
    console.log("Error found in connection of database:", err.message);
  }
}

module.exports = connectDB;