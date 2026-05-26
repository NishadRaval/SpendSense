const Expense = require('../models/Expense');

exports.getExpenses = async (req, res) => {
  try {
    const { category, type, month, search } = req.query;
    let filter = { user: req.user._id };

    if (category) filter.category = category;
    if (type) filter.type = type;
    if (month) {
      const [year, m] = month.split('-');
      const start = new Date(year, m - 1, 1);
      const end = new Date(year, m, 0, 23, 59, 59);
      filter.date = { $gte: start, $lte: end };
    }
    if (search) filter.title = { $regex: search, $options: 'i' };

    const expenses = await Expense.find(filter).sort({ date: -1 });
    res.json({ success: true, data: expenses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, user: req.user._id });
    if (!expense) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: expense });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createExpense = async (req, res) => {
  try {
    const expense = await Expense.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, data: expense });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!expense) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: expense });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!expense) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const { month } = req.query;
    let dateFilter = {};
    if (month) {
      const [year, m] = month.split('-');
      const start = new Date(year, m - 1, 1);
      const end = new Date(year, m, 0, 23, 59, 59);
      dateFilter = { $gte: start, $lte: end };
    }

    const matchExpense = { user: req.user._id, type: 'expense', ...(month ? { date: dateFilter } : {}) };
    const matchIncome = { user: req.user._id, type: 'income', ...(month ? { date: dateFilter } : {}) };

    const categoryStats = await Expense.aggregate([
      { $match: matchExpense },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } }
    ]);

    const totalExpense = await Expense.aggregate([
      { $match: matchExpense },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const totalIncome = await Expense.aggregate([
      { $match: matchIncome },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      success: true,
      data: {
        categoryStats,
        totalExpense: totalExpense[0]?.total || 0,
        totalIncome: totalIncome[0]?.total || 0,
        balance: (totalIncome[0]?.total || 0) - (totalExpense[0]?.total || 0)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};