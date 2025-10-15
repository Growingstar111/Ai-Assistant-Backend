const { User } = require("../model/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { generatedotp } = require("../commonFunction/commonFunction");
const { sendEMail } = require("../commonFunction/nodemailer");

const JWT_SECRET = process.env.JWT_SECRET_KEY || "defaultSecretKey";

async function registerUser(req, res) {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generatedotp();

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      otp,
    });

    await newUser.save();

   
    sendEMail(
      email,
      "Welcome to AI Assistant",
      `Hello ${name}, your verification code is ${otp}`
    ).catch(emailError => {
      console.error(`Failed to send registration email to ${email}:`, emailError.message);
     
    });

    res.status(201).json({
      message: "User registered successfully. OTP sent to your email.",
      data: { name, email },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}


async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "User not found" });


    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch)
      return res.status(401).json({ message: "Incorrect password" });

    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: "7d",
    });

    user.token = token;
    await user.save();

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        assistantName :user.assistantName,
        isVerified:user.isVerified
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}


async function verifyOtp(req, res) {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email, otp });
    if (!user)
      return res.status(400).json({ message: "Invalid OTP" });

    user.isVerified = true;
    user.otp = null;
    await user.save();

    res.status(200).json({
      message: "OTP verified successfully",
      data: { email: user.email, verified: true },
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}


async function resendOtp(req, res) {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "User not found" });

    const otp = generatedotp();
    user.otp = otp;
    await user.save();

    // Send email 
    sendEMail(
      email,
      "Your New Verification Code",
      `Hello ${user.name || ""}, your new verification code is ${otp}`
    ).catch(emailError => {
      console.error(`Failed to send resend OTP email to ${email}:`, emailError.message);
    });

    res.status(200).json({ message: "OTP resent successfully" });
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}


async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "User not found" });

    const otp = generatedotp();
    user.otp = otp;
    await user.save();

   
    sendEMail(
      email,
      "Password Reset OTP",
      `Hello ${user.name || ""}, your password reset OTP is ${otp}`
    ).catch(emailError => {
      console.error(`Failed to send forgot password email to ${email}:`, emailError.message);
    });

    res.status(200).json({ message: "Password reset OTP sent to your email" });
  } catch (error) {
    console.error("Forgot Password error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}


async function resetPassword(req, res) {
  try {
    const { email, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "User not found" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.otp = null;
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}


async function logoutUser(req, res) {
  try {
    const userId = req.userId;
    await User.updateOne({ _id: userId }, { $set: { token: null } });

    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

module.exports = {
  registerUser,
  loginUser,
  verifyOtp,
  resendOtp,
  forgotPassword,
  resetPassword,
  logoutUser,
};
