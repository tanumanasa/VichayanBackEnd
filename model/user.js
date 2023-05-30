const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    min: 3,
    max: 10,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  isThirdPartyUser: {
    type: Boolean,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  password: {
    type: String,
    required: function () {
      return !this.isThirdPartyUser;
    },
    trim: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  otp: {
    type: Number,
    default: -1,
  },
  verificationToken: {
    type: String,
    expire_at: { type: Date, default: Date.now, expires: 300 },
  },
  phoneNumber: {
    type: Number,
    length: 10,
  },
  city: {
    type: String,
  },
  state: {
    type: String,
  },
  country: {
    type: String,
  },
  profilePicture: {},
  coverPicture: {},
  skills: [],
  languages: [],
  designation: {
    type: String,
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
  },
  role: {
    type: String,
    enum: ["User", "Admin", "Seller"],
    default: "User",
  },
  dob: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  sequence: {
    type: Number,
    default: 0,
  },
  followers: {
    type: Array,
    default: [],
  },
  followings: {
    type: Array,
    default: [],
  },
  interests: [{
    type: String
  }],
  education: [{
    type: String
  }],
  experience: [{
    type: String
  }],
  about: {
    type: String,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  isPremium: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model("user", userSchema);

