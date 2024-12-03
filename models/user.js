const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  isVerified: {
    type: Boolean,
    default: false, // Admin will change this to true after approval.
  },
  profileCreated: {
    type: Boolean,
    default: false, // Set to true after user successfully verifies OTP.
  },
  picture: {
    type: String,
    default: ''
  },
  serviceCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  businessDetails: {
    type: String,
    trim: true
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  postCode: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
