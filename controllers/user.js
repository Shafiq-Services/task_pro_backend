const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendOtp, getOtp } = require('../utils/send_otp');  // Import the utility

// User Sign-Up
const signup = async (req, res) => {
  const { email, password, name, phoneNumber } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      password: hashedPassword,
      name,
      phoneNumber,
      isOtpVerified: false,
      isVerified: false,
    });

    await user.save();
    await sendOtp(email);  // Send OTP using utility function

    return res.status(201).json({ message: 'User registered successfully. Please verify your OTP.' });
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong.', error });
  }
};

// Verify OTP
const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const storedOtpData = getOtp(email);

    if (!storedOtpData) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    if (storedOtpData.otp !== parseInt(otp)) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    if (storedOtpData.expiry < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    await User.updateOne({ email }, { $set: { isOtpVerified: true } });

    return res.status(200).json({ message: 'OTP verified successfully. Wait for admin verification.' });
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong.', error });
  }
};

// Forgot Password
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await sendOtp(email);  // Send OTP for password reset
    return res.status(200).json({ message: 'OTP sent to your email.' });
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong.', error });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  try {

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.updateOne({ email }, { $set: { password: hashedPassword } });

    return res.status(200).json({ message: 'Password reset successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong.', error });
  }
};

// User Login
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Invalid password' });
    }
    
    if (!user.isOtpVerified) {
      await sendOtp(email);  // Re-send OTP if not verified
      return res.status(400).json({ message: 'Your OTP is not verified yet. A new OTP has been sent to your email.' });
    }

    if (!user.isVerified) {
      return res.status(400).json({ message: 'Your account is awaiting admin approval.' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong.', error });
  }
};

module.exports = { signup, verifyOtp, login, forgotPassword, resetPassword };
