const express = require("express");
const auth = require("../middleware/auth");
const {
  registerUser,
  loginUser,
  verifyOtp,
  resendOtp,
  forgotPassword,
  resetPassword,
  logoutUser,
} = require("../controller/user");

const router = express.Router();

router.post("/signup", registerUser);
router.post('/login',loginUser);
router.post('/otp/verify',verifyOtp);
router.post('/otp/resend',resendOtp);
router.post('/password/forgot',forgotPassword);
router.patch('/password/reset',resetPassword);
router.post('/logout',auth, logoutUser);


module.exports = router
