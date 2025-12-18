const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const verifyToken = require('../middleware/auth');
const validate = require('../middleware/validate');
const { registerSchema, loginSchema } = require('../utils/validationSchemas');
const { authLimiter } = require('../middleware/rateLimiter');
const { checkDeviceLimit, captureDeviceId } = require('../middleware/fraudMiddleware');

// New Routes
router.post('/register', authLimiter, checkDeviceLimit, validate(registerSchema), authController.register);
router.post('/login', authLimiter, captureDeviceId, validate(loginSchema), authController.login);
router.post('/logout', authController.logout);

// Legacy/Compatibility
router.post('/send-otp', authLimiter, authController.sendOtp);
router.post('/verify-otp', authLimiter, authController.verifyOtp);

router.post('/google', authLimiter, captureDeviceId, authController.googleLogin);
router.get('/me', verifyToken, authController.getMe);

// Update FCM
router.post('/update-fcm', auth, authController.updateFcmToken);

module.exports = router;
