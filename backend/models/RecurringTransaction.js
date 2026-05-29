const mongoose = require('mongoose');

const recurringSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  amount: { type: Number, required: true },
  category: {
    type: String,
    required: true,
    enum: ['Food','Transport','Shopping','Entertainment','Health','Education','Bills','Other']
  },
  type: { type: String, enum: ['expense', 'income'], default: 'expense' },
  account: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
  frequency: {
    type: String,
    required: true,
    enum: ['Daily', 'Weekly', 'Monthly', 'Yearly']
  },
  startDate: { type: Date, required: true },
  nextDate: { type: Date, required: true },
  note: { type: String, trim: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('RecurringTransaction', recurringSchema);