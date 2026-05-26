const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const {
  getExpenses, getExpense, createExpense, updateExpense, deleteExpense, getStats
} = require('../controllers/expenseController');

router.use(protect);
router.get('/stats', getStats);
router.route('/').get(getExpenses).post(createExpense);
router.route('/:id').get(getExpense).put(updateExpense).delete(deleteExpense);

module.exports = router;