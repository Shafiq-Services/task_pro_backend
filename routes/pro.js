const express = require('express');
const router = express.Router();
const proController = require('../controllers/pro');
const { proMiddleWare } = require("../middleWares/pro");

// Signup Route
router.post('/signup', proController.signup);

// Login Route
router.post('/login', proController.login);

// Forgot Password Route (send OTP)
router.post('/forgot-password', proController.forgotPassword);

// Reset Password Route (verify OTP and reset)
router.post('/reset-password', proController.resetPassword);

// Verify OTP
router.post('/send-otp', proController.sendOtpAPI);

// Verify OTP
router.post('/verify-otp', proController.verifyOtp);

router.use(proMiddleWare);

// create-profile
router.post('/create-profile', proController.createProfile);
module.exports = router;
