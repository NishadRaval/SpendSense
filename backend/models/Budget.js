const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    enum: ['Food','Transport','Shopping','Entertainment','Health','Education','Bills','Other']
  },
  limit: {
    type: Number,
    required: true,
    min: 1
  },
  month: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

budgetSchema.index({ category: 1, month: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);