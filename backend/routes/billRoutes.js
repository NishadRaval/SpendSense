const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const { getBills, getUpcomingBills, createBill, updateBill, markPaid, deleteBill } = require('../controllers/billController');

router.use(protect);
router.route('/').get(getBills).post(createBill);
router.get('/upcoming', getUpcomingBills);
router.route('/:id').put(updateBill).delete(deleteBill);
router.patch('/:id/paid', markPaid);

module.exports = router;