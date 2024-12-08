const Pro = require('../models/pro');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendOtp, getOtp } = require('../utils/send_otp');  // Import the utility

// User Sign-Up
const signup = async (req, res) => {
  const { email, password} = req.body;

  try {
    const userExists = await Pro.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const pro = new Pro({
      email,
      password: hashedPassword,
      profileCreated: false,
      isVerified: false,
    });

    await pro.save();
    await sendOtp(email);  // Send OTP using utility function

    return res.status(201).json({ message: 'User registered successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong.', error });
  }
};

const sendOtpAPI = async (req, res) => {
  const { email } = req.body;
  try {
    await sendOtp(email);  // Send OTP using utility function
    return res.status(200).json({ message: 'OTP sent successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong.', error });
  }
}

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

    await Pro.updateOne({ email }, { $set: { isOtpVerified: true } });

    return res.status(200).json({ message: 'OTP verified successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong.', error });
  }
};

// Forgot Password
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await Pro.findOne({ email });
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
    await Pro.updateOne({ email }, { $set: { password: hashedPassword } });

    return res.status(200).json({ message: 'Password reset successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong.', error });
  }
};

// User Login
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const pro = await Pro.findOne({ email });
    if (!pro) {
      return res.status(400).json({ message: 'User not found' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, pro.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Invalid password' });
    }
    
    const token = jwt.sign({ userId: pro._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    return res.status(200).json({ message: 'Login successful', profileCreated: pro.profileCreated, isVerified: pro.isVerified, token});

  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong.', error });
  }
};

const createProfile = async (req, res) => {
  const { profilePicture, name, serviceCategory, businessDetails, phoneNumber, address, postCode } = req.body;
  const token = req.headers.authorization?.split(" ")[1]; // Assuming the token is passed in the Authorization header

  try {
    // Verify token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const proId = decodedToken.userId; // Extract the user ID from the token

    // Find the existing profile
    const existingPro = await Pro.findById(proId);
    
    if (!existingPro) {
      return res.status(404).json({ message: "Pro not found" });
    }

    // Check if the profile is already created
    if (existingPro.profileCreated) {
      const response = {
        id: existingPro._id,
        picture: existingPro.picture,
        name: existingPro.name,
        email: existingPro.email,
        profileCreated: existingPro.profileCreated,
      };
      return res.status(200).json({ message: "Profile already created", profile: response });
    }

    // Update profile with the provided details and mark it as created
    const updatedPro = await Pro.findByIdAndUpdate(
      proId,
      {
        picture: profilePicture,
        name,
        serviceCategory,
        businessDetails,
        phoneNumber,
        address,
        postCode,
        profileCreated: true, // Mark profile as created
      },
      { new: true } // Return the updated document
    );

    // Create a response object containing only the required fields
    const response = {
      id: updatedPro._id,
      picture: updatedPro.picture,
      name: updatedPro.name,
      email: updatedPro.email,
      profileCreated: updatedPro.profileCreated,
    };

    return res.status(200).json({
      message: "Profile created successfully",
      profile: response,
    });

  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    return res.status(500).json({ message: "Something went wrong.", error });
  }
};

module.exports = { signup, verifyOtp, login, forgotPassword, resetPassword, sendOtpAPI, createProfile };
