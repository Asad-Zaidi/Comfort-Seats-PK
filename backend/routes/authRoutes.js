const express = require('express');
const router = express.Router();

const { login, me, changePassword, forgotPassword, resetPasswordWithOtp, verifyOtp } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
const { loginLimiter, passwordResetLimiter } = require('../middlewares/rateLimiter');

router.post('/login', loginLimiter, login);
router.post('/forgot-password', passwordResetLimiter, forgotPassword);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', passwordResetLimiter, resetPasswordWithOtp);
router.get('/me', protect, me);
router.put('/change-password', protect, changePassword);

module.exports = router;
