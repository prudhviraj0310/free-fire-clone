
const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { depositSchema } = require('../utils/validationSchemas');
const { limiter } = require('../middleware/rateLimiter');

router.use(limiter); // Global Rate Limit for wallet actions

router.post('/deposit', auth, validate(depositSchema), walletController.initiateDeposit);
router.get('/balance', auth, walletController.getWalletBalance);
router.get('/history', auth, walletController.getTransactionHistory);

// Public Payment Routes
router.get('/public/payment/:id', walletController.getPaymentDetails);
router.post('/public/payment/submit', walletController.submitPaymentUTR);

module.exports = router;
