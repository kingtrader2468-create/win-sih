const express = require('express');
const {
  googleAuth,
  register,
  requestRegisterOtp,
  verifyRegisterOtp,
  requestForgotPasswordOtp,
  resetPasswordVerify,
  login,
  getMe
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Google OAuth
router.post('/google', googleAuth);

// Credentials login
router.post('/login', login);

// OTP-based registration flow
router.post('/register-otp', requestRegisterOtp);
router.post('/register-verify', verifyRegisterOtp);

// OTP-based password reset flow
router.post('/forgot-password-otp', requestForgotPasswordOtp);
router.post('/reset-password-verify', resetPasswordVerify);

// Legacy direct registration
router.post('/register', register);

// Profile
router.get('/me', protect, getMe);

module.exports = router;
