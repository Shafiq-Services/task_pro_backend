const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');

// Signup Route
router.post('/signup', userController.signup);

// Login Route
router.post('/login', userController.login);

// Forgot Password Route (send OTP)
router.post('/forgot-password', userController.forgotPassword);

// Reset Password Route (verify OTP and reset)
router.post('/reset-password', userController.resetPassword);

// Verify OTP
router.post('/send-otp', userController.sendOtpAPI);

// Verify OTP
router.post('/verify-otp', userController.verifyOtp);

module.exports = router;
