const Budget = require('../models/Budget');

exports.getBudgets = async (req, res) => {
  try {
    const { month } = req.query;
    const filter = { user: req.user._id };
    if (month) filter.month = month;
    const budgets = await Budget.find(filter);
    res.json({ success: true, data: budgets });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.setBudget = async (req, res) => {
  try {
    const { category, limit, month } = req.body;
    const budget = await Budget.findOneAndUpdate(
      { category, month, user: req.user._id },
      { limit },
      { upsert: true, new: true, runValidators: true }
    );
    res.json({ success: true, data: budget });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.deleteBudget = async (req, res) => {
  try {
    await Budget.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ success: true, message: 'Budget removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};