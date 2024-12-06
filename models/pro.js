const mongoose = require('mongoose');

const proSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  name: { type: String, default: "", trim: true },
  isVerified: { type: Boolean, default: false },
  profileCreated: { type: Boolean, default: false },
  picture: { type: String, default: '' },
  serviceCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  businessDetails: { type: String, trim: true },
  phoneNumber: { type: String, trim: true },
  address: { type: String, trim: true },
  postCode: { type: String, trim: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Pro', proSchema);