const router = require("express").Router();
const {
userRegister,
loginUser,
verifyOTP,
resetPassword,
forgotPassword,
resendOtp,
resendforgotPasswordCode
  
  } = require("../controllers/auth");



router.route('/signup').post(userRegister);
router.route('/login').post(loginUser);
router.route('/verify').post(verifyOTP);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/resendOtp", resendOtp);
router.post("/resendpasswordCode", resendforgotPasswordCode);


module.exports = router;
