const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  type: {
    type: String,
    required: true,
    enum: ['Cash', 'Bank', 'UPI', 'Credit Card', 'Debit Card', 'Other']
  },
  bankName: { type: String, trim: true },
  balance: { type: Number, default: 0 },
  color: { type: String, default: '#0a0a0a' },
  isDefault: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Account', accountSchema);