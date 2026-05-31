const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  title: { type: String, required: [true, 'Title is required'], trim: true, maxlength: 100 },
  amount: { type: Number, required: [true, 'Amount is required'], min: [0.01, 'Amount must be positive'] },
  category: {
    type: String,
    required: true,
    enum: [
      // Expense categories
      'Food', 'Transport', 'Shopping', 'Entertainment', 'Health',
      'Education', 'Bills', 'Other',
      // Income categories
      'Salary', 'Freelance', 'Business', 'Investment', 'Gift', 'Rental'
    ]
  },
  type: { type: String, enum: ['expense', 'income', 'transfer'], default: 'expense' },
  account: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
  transferToAccount: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
  note: { type: String, trim: true, maxlength: 300 },
  date: { type: Date, default: Date.now },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isRecurring: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);