const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");
const { getSignedUrl } = require("../utils/s3");

//SEND Email
const sendGrid = require("../utils/sendgrid");
// const sendEmail = require("../utils/sendEmail");

//Models
const User = require("../model/user");

//Config
const keys = require("../config/keys");

module.exports = {
  userRegister: async (req, res, next) => {
    try {
      let errors = {};
      const { name, email, password, phoneNumber } = req.body;
      // const { name, email, password, phoneNumber } = req.body;
      const user = await User.findOne({ email });
      if (user) {
        errors.email = "Email already exist";
        return res.status(400).json(errors);
      }
      // console.log("1");

      let hashedPassword;
      hashedPassword = await bcrypt.hash(password, 8);
      // console.log("1");
      // let { sequence } = await User.findOne()
      //   .sort({ createdAt: -1 })
      //   .select("sequence");
      // sequence = sequence + 1;
      //GENERATE OTP
      const OTP = Math.floor(100000 + Math.random() * 900000);
      // console.log("2");

      const newUser = await new User({
        name,
        email,
        password: hashedPassword,
        // isThirdPartyUser,
        phoneNumber,
        // sequence,
        otp: OTP,
        isEmailVerified: false,
      });
      await newUser.save();
      console.log(newUser);
      // const body = `Hi Here is OTP ${OTP} for email verification`;
      // const emailReq = {
      //   recieverMail: email,
      //   subject: "Email Verification",
      //   html: body,
      // };
      // await sendGrid.sendMail(emailReq);

      //SEND MAIL TO USER FOR EMAIL VERIFICATION
      const message = `
        <h1>Email verificatoin </h1>
        <p>Please verify your email to continue</p>
        <p>Here is OTP:  ${OTP} for verification</p>
      `;
      await sendGrid({
        to: email,
        subject: "Email verification",
        text: message,
      });
      res.status(200).json({
        message: "User registerd successfully, kindly verify your mail",
        success: true,
        email: newUser.email,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  },
  verifyEmail: async (req, res, next) => {
    try {
      const { email, verificationCode } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ success: false, message: "Email does not exist" });
      }
      if (user.otp !== Number(verificationCode)) {
        return res
          .status(401)
          .json({ success: false, message: "Invalid verification code" });
      }
      user.isEmailVerified = true;
      await user.save();
      return res
        .status(200)
        .json({ success: true, message: "Email verified successfully" });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  },
  userLogin: async (req, res, next) => {
    try {
      let errors = {};
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        errors.email = "Email doesnt not exist";
        return res.status(400).json(errors);
      }
      const isCorrect = await bcrypt.compare(password, user.password);
      if (!isCorrect) {
        errors.password = "Invalid Credentials";
        return res.status(404).json(errors);
      }
      const OTP = Math.floor(100000 + Math.random() * 900000);
      //SEND MAIL TO USER FOR EMAIL VERIFICATION
      const message = `
        <h1>Login OTP Verificatoin </h1>
        <p>Please verify your email to continue</p>
        <p>Here is OTP:  ${OTP} for login</p>
      `;
      await sendGrid({
        to: email,
        subject: "Email verification",
        text: message,
      });
      //   await sendGrid.sendMail(emailReq);
      // const user = await User.findOne({ email });
      user.otp = Number(OTP);
      console.log(OTP);
      await user.save();
      res.status(201).json({
        message: `User logged in and otp sent to ${email}`,
        success: true,
        email: user.email,
      });
    } catch (err) {
      return res.status(400).json({ message: `Error in login ${err.message}` });
    }
  },

  sendOTP: async (req, res, next) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res
          .status(200)
          .json({ success: false, message: "Fields are empty" });
      }
      const OTP = Math.floor(100000 + Math.random() * 900000);
      //SEND MAIL TO USER FOR EMAIL VERIFICATION
      const message = `
        <h1>Email Verificatoin </h1>
        <p>Please verify your email to continue</p>
        <p>Here is OTP:  ${OTP} for verification</p>
      `;
      await sendGrid({
        to: email,
        subject: "Email verification",
        text: message,
      });
      //   await sendGrid.sendMail(emailReq);
      const user = await User.findOne({ email });
      user.otp = Number(OTP);
      console.log(OTP);
      await user.save();
      return res.status(200).json({
        success: true,
        message: `OTP has been sent to email, it will be only valid for 5 minutes`,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  },

  verifyOTP: async (req, res) => {
    try {
      const { email, otp } = req.body;
      // if (!newPassword || !otp || !email) {
      //   return res
      //     .status(404)
      //     .json({ success: false, message: "Fields are empty" });
      // }
      const user = await User.findOne({ email });
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found with given email" });
      }
      if (user.otp === -1) {
        return res
          .status(400)
          .json({ success: false, message: "Given OTP is expired" });
      }
      if (user.otp !== Number(otp)) {
        return res.status(400).json({ success: false, message: "Invalid OTP" });
      }
      const payload = {
        email,
      };
      // console.log(_id);
      // console.log(user);
      jwt.sign(payload, keys.secretKey, { expiresIn: 7200 }, (err, token) => {
        res.json({
          message: "Otp verified",
          success: true,
          // token: "Bearer " + token,
          token: token,
          userInfo: user,
        });
      });
      // let hashedPassword;
      // hashedPassword = await bcrypt.hash(newPassword, 10);
      // user.password = hashedPassword;
      // user.otp = -1;
      // await user.save();
      // return res.status(200).json({
      //   success: true,
      //   message: "Password has been change successfully",
      //   response: user,
      // });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  },
  deleteUser: async (req, res, next) => {
    try {
      const { _id } = req.user;
      const user = await User.findByIdAndDelete(_id);
      return res.status(200).json({
        success: true,
        message: "User deleted successfully",
        response: user._id,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  },
  updatePassword: async (req, res, next) => {
    try {
      const { _id } = req.user;
      const { oldPassword, newPassword } = req.body;
      const user = await User.findById(_id);
      const isCorrect = await bcrypt.compare(oldPassword, user.password);
      if (!isCorrect) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid old password" });
      }
      let hashedPassword;
      hashedPassword = await bcrypt.hash(newPassword, 15);
      user.newPassword = hashedPassword;
      await user.save();
      return res
        .status(200)
        .json({ success: true, message: "Password updated successfully" });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  },
  updateProfilePicture: async (req, res, next) => {
    try {
      const { _id } = req.user;
      let profilePicture = {};
      if (req.file) {
        let url = getSignedUrl(req.file.key);
        (profilePicture.originalname = req.file.originalname),
          (profilePicture.url = url),
          (profilePicture.key = req.file.key);
      }
      const user = await User.findById(_id);
      user.profilePicture = profilePicture;
      await user.save();
      return res.status(200).json({
        success: true,
        message: "Profile picture updated successfully",
        response: user,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  },
  updateBackgroundPicture: async (req, res, next) => {
    try {
      const { _id } = req.user;
      let backgroundPicture = {};
      if (req.file) {
        let url = getSignedUrl(req.file.key);
        (backgroundPicture.originalname = req.file.originalname),
          (backgroundPicture.url = url),
          (backgroundPicture.key = req.file.key);
      }
      const user = await User.findById(_id);
      user.backgroundPicture = backgroundPicture;
      await user.save();
      return res.status(200).json({
        success: true,
        message: "Profile picture updated successfully",
        response: user,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  },
  fetchUserFromGoogle: async (req, res, next) => {
    try {
      const user = req.user;
      const payload = {
        _id: user._id,
        name: user.name,
        email: user.email,
      };
      jwt.sign(payload, keys.secretKey, { expiresIn: 7200 }, (err, token) => {
        res.json({
          message: "User logged in successfully using google",
          success: true,
          token: "Bearer " + token,
        });
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  },
  getUser: async (req, res, next) => {
    try {
      const { id } = req.user;
      const user = await User.findById(ObjectId(id));
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found", response: {} });
      }
      return res
        .status(200)
        .json({ success: true, message: "User found", response: user });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  },
  updateUser: async (req, res, next) => {
    try {
      const { _id } = req.user;
      const { skills, languages, gender, dob } = req.body;
      const user = await User.findById(ObjectId(_id));
      if (skills) {
        user.skills = skills;
      }
      if (languages) {
        user.languages = languages;
      }
      if (gender) {
        user.gender = gender;
      }
      if (dob) {
        user.dob = dob;
      }
      await user.save();
      return res.status(200).json({
        success: true,
        message: "User updated successfully",
        response: user,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  },
  searchUserByName: async (req, res, next) => {
    try {
      const { name } = req.query;
      const users = await User.find({ name });
      return res.status(200).json({
        success: true,
        message: "User found successfully",
        response: users,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  },
};
