const url = require('url');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");
const { getSignedUrl } = require("../utils/s3");

//SEND Email
const { sendGrid } = require("../utils/sendgrid");
// const sendEmail = require("../utils/sendEmail");

//Models
const User = require("../model/user");
const Follow = require('../model/follow');

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
      const payload = {
        email,
        _id: user._id
      };
      user.password = null;
      jwt.sign(payload, keys.secretKey, { expiresIn: 7200 }, (err, token) => {
        res.json({
          message: "Email verified successfully",
          success: true,
          token: token,
          userInfo: user,
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
      const payload = {
        email,
        _id: user._id
      }
      jwt.sign(payload, keys.secretKey, { expiresIn: 7200 }, (err, token) => {
        res.json({
          message: "User Logged in successfully",
          success: true,
          token: token,
          userInfo: user,
        });
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
      console.log(user)
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
      user.password = null;
      const payload = {
        email,
        _id: user._id
      };
      jwt.sign(payload, keys.secretKey, { expiresIn: 7200 }, (err, token) => {
        res.json({
          message: "Otp verified",
          success: true,
          // token: "Bearer " + token,
          token: token,
          userInfo: user,
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

  forgotPassword: async (req, res, next) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res
          .status(200)
          .json({ success: false, message: "Fields are empty" });
      }

      const user = await User.findOne({ email });

      if (!user) {
        return res
          .status(400)
          .json({ success: false, message: "Email does not exist" });
      }
      
      console.log("****************", user)
      user.isEmailVerified = true;
      user.isVerified = true;
      const OTP = Math.floor(100000 + Math.random() * 900000);
      //SEND MAIL TO USER FOR Password Reset
      const message = `
        <h1>Password Reset </h1>
        <p>Please reset your password</p>
        <p>Here is OTP:  ${OTP} for verification</p>
      `;

      await sendGrid({
        to: email,
        subject: "Password Reset",
        text: message,
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  },

  resetPassword: async (req, res, next) => {
    try {
      const { _id,token } = req.user;
      const { password, conformPassword } = req.body;
      const user = await User.findById(_id);
      const isCorrect = await bcrypt.compare(password, conformPassword);
      if (!isCorrect) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid password" });
      }

      // jwt.verify(token, keys.secretKey, (err, decode) => decode !== undefined ?  decode : err)

      let hashedPassword;
      hashedPassword = await bcrypt.hash(password, 15);
      user.password = hashedPassword;
      await user.save();
      return res
        .status(200)
        .json({ success: true, message: "Password reset successfully" });
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
      user.password = hashedPassword;
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
      // const { id } = req.user;
      const { id } = req.params;
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
  getAllUser: async (req, res, next) => {
    try {
      const { _id } = req.user;
      const userId = { _id: { $nin: [_id] } }
      const queryParams = url.parse(req.url, true).query;

      const queryObject = {
        ...userId,
        ...queryParams
      };
      const user = await User.find(queryObject, { password: 0, otp: 0 });
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found", response: {} });
      }
      return res
        .status(200)
        .json({ success: true, message: "User List", response: user });
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
  fetchInterests: async (req, res) => {
    const interests = ["Programming", "Javascript", "Android", "Backend Development", "Frontend Developmen", "Software Engineering"];
    return res.status(200).json({
      success: true,
      message: "Interests fetched",
      response: interests
    })
  },
  addInterests: async (req, res) => {
    try {
      const { _id } = req.user;
      const { interests } = req.body;
      const result = await User.findByIdAndUpdate(_id, { $addToSet: { interests: { $each: interests } } }, { new: true }).select('interests');
      return res
        .status(200)
        .json({
          success: true,
          message: "Interests added",
          response: result
        });

    } catch (error) {
      return res
        .status(500)
        .json({
          success: false,
          message: "Internal server error",
          error: error.message
        })
    }
  },
  removeInterests: async (req, res) => {
    try {
      const { _id } = req.user;
      const { interests } = req.body;
      const result = await User.findByIdAndUpdate(_id, { $pull: { interests: { $in: interests } } }, { new: true }).select('interests');
      return res.status(200).json({
        success: true,
        message: "Interests removed",
        response: result
      })
    } catch (error) {
      return res
        .status(500)
        .json({
          success: false,
          message: "Internal server error",
          error: error.message
        })
    }
  },
  setPremium: async (req, res) => {
    try {
      const { _id } = req.user;
      const user = await User.findByIdAndUpdate(_id, { isPremium: true }, { new: true });
      return res.status(200).json({
        success: true,
        message: "Set premium successfully",
        response: user
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message
      });
    }
  },
  followUser: async (req, res) => {
    try {
      const { _id } = req.user;
      const { id } = req.params;
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
          response: {}
        })
      }
      if (!(user.isPremium)) {
        return res.status(400).json({
          success: false,
          message: "User does not have premium",
          response: {}
        })
      }
      const follow = new Follow({
        userId: id,
        createdBy: _id
      });
      await follow.save();
      return res.status(200).json({
        success: true,
        message: "Followed user successfully",
        response: follow
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message
      });
    }
  },
  syncContacts: async (req, res) => {
    try {
      const { contacts } = req.body;
      let present = [], notPresent = [];
      const existingUsers = await User.find({ phoneNumber: { $in: contacts } });
      existingUsers.forEach(user => present.push(user.phoneNumber));
      notPresent = contacts.filter(phoneNumber => !present.includes(phoneNumber));
      return res.status(200).json({
        success: true,
        message: "Contacts synced",
        response: {
          present,
          notPresent
        }
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message
      });
    }
  },
  addEducationOfUser: async (req, res) => {
    try {
      const { _id } = req.user;
      const { education } = req.body;
      const result = await User.findByIdAndUpdate(_id, { $addToSet: { education: { $each: education } } }, { new: true }).select('education');
      return res
        .status(200)
        .json({
          success: true,
          message: "Education added",
          response: result
        });

    } catch (error) {
      return res
        .status(500)
        .json({
          success: false,
          message: "Internal server error",
          error: error.message
        })
    }
  },

  addExperienceOfUser: async (req, res) => {
    try {
      console.log("*******???",req.body)
      const { _id } = req.user;
      const { experience } = req.body;
      const result = await User.findByIdAndUpdate(_id, { $addToSet: { experience: { $each: experience } } }, { new: true }).select('experience');
      return res
        .status(200)
        .json({
          success: true,
          message: "Experience added",
          response: result
        });

    } catch (error) {
      return res
        .status(500)
        .json({
          success: false,
          message: "Internal server error",
          error: error.message
        })
    }
  },

  addAboutOfUser: async (req, res) => {
    try {
      const { _id } = req.user;
      const { about } = req.body;
      const user = await User.findById(_id);
      if(!user){
        return res
          .status(400)
          .json({ success: false, message: "Invalid user" });
      }
      user.about = about;
      await user.save();
      return res
        .status(200)
        .json({
          success: true,
          message: "about added",
          response: user.about
        });

    } catch (error) {
      return res
        .status(500)
        .json({
          success: false,
          message: "Internal server error",
          error: error.message
        })
    }
  },
  
  getAboutOfUser: async (req, res) => {
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
        .json({ success: true, message: "About user", response: user.about});
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  },

  addSkillsOfUser: async (req, res) => {
    try {
      const { _id } = req.user;
      const { skills } = req.body;
      const result = await User.findByIdAndUpdate(_id, { $addToSet: { skills: { $each: skills } } }, { new: true }).select('skills');
      return res
        .status(200)
        .json({
          success: true,
          message: "skills added",
          response: result
        });

    } catch (error) {
      return res
        .status(500)
        .json({
          success: false,
          message: "Internal server error",
          error: error.message
        })
    }
  },
  getSkillsOfUser: async (req, res) => {
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
        .json({ success: true, message: "User found", response: user.skills });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  },
  updateSkillsUser: async (req, res, next) => {
    try {
      const {_id} = req.user;
      // const {id} = req.params;
      const {id, skills} = req.body;
      const newAbout = await User.findByIdAndUpdate(id, {skills}, {new: true});
      if(!newAbout){
        return res
        .status(404)
        .json({ success: false, message: "Invalid id", response: {} });
      }
      return res
        .status(200)
        .json({
          success: true,
          message: "skills updated successfully",
          response: newAbout,
        });
    } catch (error) {
      return res
      .status(500)
      .json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  },

};
