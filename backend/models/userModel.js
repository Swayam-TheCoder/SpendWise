const mongoose = require('mongoose');
const { minLength, maxLength, lowercase, boolean } = require('zod');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    minLength: 2,
    maxLength: 50
  },

  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true
  },

  password: {
    type: String,
    required: [true, "Password is required"],
    minLength: 6,
    select: false
  },

  profileImg: {
    type: String,
    default: ""
  },

  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  },

  isVerified: {
    type: Boolean,
    default: false
  },

  refreshToken: {
    type: String,
    default: null
  }
},
{
  timestamps: true
})

module.exports = mongoose.model("User", userSchema);