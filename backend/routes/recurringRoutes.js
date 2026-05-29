const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const { getRecurring, createRecurring, updateRecurring, deleteRecurring, executeRecurring } = require('../controllers/recurringController');

router.use(protect);
router.route('/').get(getRecurring).post(createRecurring);
router.post('/execute', executeRecurring);
router.route('/:id').put(updateRecurring).delete(deleteRecurring);

module.exports = router;