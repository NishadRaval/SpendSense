const Bill = require('../models/Bill');

exports.getBills = async (req, res) => {
  try {
    const now = new Date();
    const bills = await Bill.find({ user: req.user._id }).sort({ dueDate: 1 });
    // Auto mark overdue
    for (const bill of bills) {
      if (bill.status === 'Pending' && new Date(bill.dueDate) < now) {
        bill.status = 'Overdue';
        await bill.save();
      }
    }
    res.json({ success: true, data: bills });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getUpcomingBills = async (req, res) => {
  try {
    const now = new Date();
    const in7days = new Date();
    in7days.setDate(now.getDate() + 7);
    const bills = await Bill.find({
      user: req.user._id,
      status: { $in: ['Pending', 'Overdue'] },
      dueDate: { $lte: in7days }
    }).sort({ dueDate: 1 });
    res.json({ success: true, data: bills });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createBill = async (req, res) => {
  try {
    const bill = await Bill.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, data: bill });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateBill = async (req, res) => {
  try {
    const bill = await Bill.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!bill) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: bill });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.markPaid = async (req, res) => {
  try {
    const bill = await Bill.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { status: 'Paid' },
      { new: true }
    );
    if (!bill) return res.status(404).json({ success: false, message: 'Not found' });
    if (bill.isRecurring) {
      const next = new Date(bill.dueDate);
      next.setMonth(next.getMonth() + (bill.recurringMonths || 1));
      await Bill.create({
        user: bill.user, title: bill.title, amount: bill.amount,
        category: bill.category, dueDate: next,
        reminderDays: bill.reminderDays, status: 'Pending',
        isRecurring: true, recurringMonths: bill.recurringMonths
      });
    }
    res.json({ success: true, data: bill });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteBill = async (req, res) => {
  try {
    await Bill.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};