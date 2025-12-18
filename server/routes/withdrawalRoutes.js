const express = require('express');
const router = express.Router();
const withdrawalController = require('../controllers/withdrawalController');
const auth = require('../middleware/auth');

// User routes
router.post('/request', auth, withdrawalController.requestWithdrawal);
router.get('/my', auth, withdrawalController.getMyWithdrawals);

module.exports = router;
