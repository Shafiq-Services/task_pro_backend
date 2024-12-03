const nodemailer = require('nodemailer');

// Temporary storage for OTPs
const otpStorage = {};  // OTPs stored as { email: { otp, expiry } }

// Function to generate and send OTP
const sendOtp = async (email) => {
  // Generate a 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000);
  const expiry = Date.now() + 10 * 60 * 1000;

  // Save OTP temporarily for 10 minutes
  otpStorage[email] = { otp, expiry };
  
  // Debug logs

  // Create a transporter for sending emails
  const transporter = nodemailer.createTransport({
    service: 'gmail',  // Change to your mail service
    auth: {
      user: process.env.EMAIL,  // Your email address
      pass: process.env.EMAIL_PASSWORD   // Your email password or app-specific password
    }
  });

  // Mail options
  const mailOptions = {
    from: 'Task Pro',
    to: email,
    subject: 'Your OTP for Login Verification',
    text: `Your OTP is: ${otp}. This OTP is valid for 10 minutes.`
  };

  try {
    // Send the email with the OTP
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw new Error('Failed to send OTP');
  }
};

// Function to get the OTP from storage (for verification purposes)
const getOtp = (email) => {
  const storedOtpData = otpStorage[email];

  return storedOtpData;
};

// Export functions
module.exports = { sendOtp, getOtp };
