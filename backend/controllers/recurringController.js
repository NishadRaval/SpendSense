const RecurringTransaction = require('../models/RecurringTransaction');
const Expense = require('../models/Expense');
const Account = require('../models/Account');

const getNextDate = (date, frequency) => {
  const next = new Date(date);
  if (frequency === 'Daily') next.setDate(next.getDate() + 1);
  else if (frequency === 'Weekly') next.setDate(next.getDate() + 7);
  else if (frequency === 'Monthly') next.setMonth(next.getMonth() + 1);
  else if (frequency === 'Yearly') next.setFullYear(next.getFullYear() + 1);
  return next;
};

exports.getRecurring = async (req, res) => {
  try {
    const recurring = await RecurringTransaction.find({ user: req.user._id }).populate('account', 'name type').sort({ nextDate: 1 });
    res.json({ success: true, data: recurring });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createRecurring = async (req, res) => {
  try {
    const { title, amount, category, type, account, frequency, startDate, note } = req.body;
    const recurring = await RecurringTransaction.create({
      user: req.user._id, title, amount, category,
      type: type || 'expense', account, frequency,
      startDate: new Date(startDate),
      nextDate: new Date(startDate),
      note, isActive: true
    });
    res.status(201).json({ success: true, data: recurring });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateRecurring = async (req, res) => {
  try {
    const recurring = await RecurringTransaction.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!recurring) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: recurring });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.deleteRecurring = async (req, res) => {
  try {
    await RecurringTransaction.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.executeRecurring = async (req, res) => {
  try {
    const now = new Date();
    const due = await RecurringTransaction.find({ user: req.user._id, isActive: true, nextDate: { $lte: now } });
    const created = [];
    for (const r of due) {
      const expense = await Expense.create({
        title: r.title, amount: r.amount, category: r.category,
        type: r.type, account: r.account, note: r.note,
        date: r.nextDate, user: r.user, isRecurring: true
      });
      if (r.account) {
        const acc = await Account.findById(r.account);
        if (acc) {
          acc.balance += r.type === 'income' ? r.amount : -r.amount;
          await acc.save();
        }
      }
      r.nextDate = getNextDate(r.nextDate, r.frequency);
      await r.save();
      created.push(expense);
    }
    res.json({ success: true, executed: created.length, data: created });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};