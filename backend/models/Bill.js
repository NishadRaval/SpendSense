const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  amount: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  category: {
    type: String,
    enum: ['Electricity', 'Internet', 'Credit Card', 'Insurance', 'Rent', 'Loan EMI', 'Subscription', 'Other'],
    default: 'Other'
  },
  reminderDays: { type: Number, default: 3 },
  status: { type: String, enum: ['Pending', 'Paid', 'Overdue'], default: 'Pending' },
  isRecurring: { type: Boolean, default: false },
  recurringMonths: { type: Number, default: 1 },
  note: { type: String, trim: true }
}, { timestamps: true });

module.exports = mongoose.model('Bill', billSchema);