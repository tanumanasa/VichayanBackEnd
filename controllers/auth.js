const jwt = require("jsonwebtoken");

//Models
const User = require("../models/User");

//SEND MAIL
const sendEmail = require("../utils/mailer");

//hashed method
const { hashPassword, comparePassword } =  require("../utils/auth");

module.exports = {
  userRegister: async (req, res, next) => {
    try {
      const { firstName, lastName, email, password } = req.body;
      console.log(firstName, lastName, email, password);

      if (!password || password.length < 6) {
        return res
          .status(400)
          .send("Password is required and should be min 6 characters long");
      }

      let userExist = await User.findOne({ email });

      if (userExist) return res.status(400).send("Email is taken");

    // hash password
    const hashedPassword = await hashPassword(password);

      const OTP = Math.floor(100000 + Math.random() * 900000);
      console.log("sendOTP", OTP);

     // register
     const user = new User({
        firstName, lastName,
        email,
        password: hashedPassword,
      });

      user.otp = OTP;
      await user.save();
       sendEmail(user.email, OTP);
      res.json({
        success: true,
        message: `OTP has been sent to ${email}.Please check your Email`,
        data: user,
      });
    } catch (err) {
      console.log("Error in userRegister", err.message);
      return res
        .status(400)
        .json({ message: `Error in userRegister ${err.message}` });
    }
  },
  verifyOTP: async (req, res, next) => {
    try {
      const { email, otp } = req.body;
      if (!email && !otp) {
        return res
          .status(404)
          .json({ message: "Fields are empty", success: false });
      }

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({
          message: "Invalid email, Data not found",
          success: false,
          response: {},
        });
      }
      if (user.otp !== otp) {
        return res.status(404).json({
          message: "OPT is incorrect",
          success: false,
          response: {},
        });
      }
      user.otp = "";
      await user.save();
      if (user) {
        var token = jwt.sign({ _id: user._id, email }, process.env.jwt_secret);
        return res.status(200).json({
          message: "Succesfully logged in",
          success: true,
          token: "Bearer " + token,
          response: user,
        });
      }
      return res.status(200).json({
        message: "OTP is correct, Please complete profile",
        success: true,
        response: user,
      });
    } catch (err) {
      console.log("Error in customerLogin", err.message);
      return res
        .status(400)
        .json({ message: `Error in customerLogin ${err.message}` });
    }
  },
  loginUser: async (req, res, next) => {
    try {
      const { email, password } = req.body;
      if (!email && !password) {
        return res
          .status(404)
          .json({ message: "Fields are empty", success: false });
      }

      const user = await User.findOne({ email }).exec();
      if (!user) return res.status(400).send("No user found");
      // check password
      const match = await comparePassword(password, user.password);
      if (!match) return res.status(400).send("Wrong password");
  
      await user.save();
      if (user) {
        var token = jwt.sign({ _id: user.id, email}, process.env.jwt_secret);
        return res.status(200).json({
          message: "Succesfully logged in",
          success: true,
          token: token,
          response: user,
        });
   
    }

    } catch (err) {
      console.log("Error in customerLogin", err.message);
      return res
        .status(400)
        .json({ message: `Error in customerLogin ${err.message}` });
    }
  },
  forgotPassword :async (req, res, next) => {
    try {
      const { email } = req.body;
  
      const verifyCode = Math.floor(100000 + Math.random() * 900000);
      const user = await User.findOneAndUpdate(
        { email },
        { passwordResetCode: verifyCode }
      );
      if (!user) return res.status(400).send("User not found")
       sendEmail(user.email, verifyCode );
        res.json({
          success: true,
          message: ` A verification Code  has been sent to ${email}.Please check your Email`,
          
        });
    } catch (err) {
      console.log(err);
    }
  },
  resetPassword : async (req, res) => {
    try {
      const { email, code, password } = req.body;
      // console.table({ email, code, newPassword });
      const hashedPassword = await hashPassword(password);
  
      const user = User.findOneAndUpdate(
        {
          email,
          passwordResetCode: code,
        },
        {
          password: hashedPassword,
          passwordResetCode: "",
        }
      ).exec();
      res.json({ ok: true });
    } catch (err) {
      console.log(err);
      return res.status(400).send("Error! Try again.");
    }
},
resendforgotPasswordCode : async (req, res) => {
  try {
    const { email} = req.body;
    const verifyCode = Math.floor(100000 + Math.random() * 900000);
    const user = await User.findOneAndUpdate(
      { email },
      { passwordResetCode:verifyCode }
    );
    if (!user) return res.status(400).send("User not found");
    await sendEmail(user.email, verifyCode );
    res.json({ ok: true, message: ` A verification Code  has been sent to ${email}.Please check your Email`, });
  } catch (err) {
    console.log(err);
    return res.status(400).send("Error! Try again.");
  }
},
resendOtp : async (req, res) => {
  try {
    const { email} = req.body;
    const verifyCode = Math.floor(100000 + Math.random() * 900000);
    const user = await User.findOneAndUpdate(
      { email },
      { otp:verifyCode }
    );
    if (!user) return res.status(400).send("User not found");
    await sendEmail(user.email, verifyCode );
    res.json({ ok: true, message: ` A verification Code  has been sent to ${email}.Please check your Email`, });
  } catch (err) {
    console.log(err);
    return res.status(400).send("Error! Try again.");
  }
},
}
