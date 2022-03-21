const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      min: 3,
      max: 20,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      min: 3,
      max: 20,
    },

    email: {
      type: String,
      required: true,
      max: 50,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      min: 6,
    },
    profilePicture: {
      type: String,
      default: "",
    },
    role: {
      type: [String],
      default: ["Subscriber"],
      enum: ["Subscriber", "Seller", "Admin"],
    },
    passwordResetCode: {
      type: String,
      default: "",
    },
    otp: {
      type: String,
      default: "",
    },

    relationship: {
      type: Number,
      enum: [1, 2, 3],
    },
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    profile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
    },
    friends: [
      {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
      }
  ],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
