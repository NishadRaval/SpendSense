const Account = require('../models/Account');
const Expense = require('../models/Expense');

exports.getAccounts = async (req, res) => {
  try {
    const accounts = await Account.find({ user: req.user._id }).sort({ createdAt: 1 });
    const totalNetWorth = accounts.reduce((sum, a) => sum + a.balance, 0);
    res.json({ success: true, data: accounts, totalNetWorth });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createAccount = async (req, res) => {
  try {
    const { name, type, bankName, balance, color, isDefault } = req.body;
    if (isDefault) await Account.updateMany({ user: req.user._id }, { isDefault: false });
    const account = await Account.create({ user: req.user._id, name, type, bankName, balance: balance || 0, color: color || '#0a0a0a', isDefault: isDefault || false });
    res.status(201).json({ success: true, data: account });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateAccount = async (req, res) => {
  try {
    if (req.body.isDefault) await Account.updateMany({ user: req.user._id }, { isDefault: false });
    const account = await Account.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!account) return res.status(404).json({ success: false, message: 'Account not found' });
    res.json({ success: true, data: account });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const account = await Account.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!account) return res.status(404).json({ success: false, message: 'Account not found' });
    res.json({ success: true, message: 'Account deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.transferFunds = async (req, res) => {
  try {
    const { fromAccount, toAccount, amount, note } = req.body;
    if (!fromAccount || !toAccount || !amount) return res.status(400).json({ success: false, message: 'From account, to account and amount required' });

    const from = await Account.findOne({ _id: fromAccount, user: req.user._id });
    const to = await Account.findOne({ _id: toAccount, user: req.user._id });
    if (!from || !to) return res.status(404).json({ success: false, message: 'Account not found' });

    from.balance -= amount;
    to.balance += amount;
    await from.save();
    await to.save();

    await Expense.create({
      title: `Transfer to ${to.name}`,
      amount, category: 'Other', type: 'transfer',
      account: fromAccount, transferToAccount: toAccount,
      note: note || '', user: req.user._id
    });

    res.json({ success: true, message: 'Transfer successful', from, to });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};