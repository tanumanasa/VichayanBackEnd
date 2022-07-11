const express = require("express");
const router = express.Router();
const passport = require("passport");
const { upload } = require("../utils/s3");

const {
  userLogin,
  userRegister,
  verifyEmail,
  sendOTP,
  verifyOTP,
  deleteUser,
  updatePassword,
  updateProfilePicture,
  updateBackgroundPicture,
  fetchUserFromGoogle,
  getUser,
  getAllUser,
  updateUser,
  searchUserByName,
} = require("../controller/user");

//USER REGISTER
router.post("/register", userRegister);

//USER Email Verify
router.post("/emailverify", verifyEmail);

// USER LOGIN
router.post("/login", userLogin);

//SEND OTP
router.post("/sendOTP", sendOTP);

//VERIFY OTP
router.post("/verifyOTP", verifyOTP);

//UPDATE PASSWORD
router.post(
  "/updatePassword",
  passport.authenticate("jwt", { session: false }),
  updatePassword
);

//GET USER BY ID
router.get(
  "/single/:id",
  passport.authenticate("jwt", { session: false }),
  getUser
);

//GET USER BY ID
router.get(
  "/all",
  passport.authenticate("jwt", { session: false }),
  getAllUser
);

//UPDATE USER
router.put("/", passport.authenticate("jwt", { session: false }), updateUser);

//DELTE USER
router.delete("/", deleteUser);

//UPDATE PROFILE PICTURE
router.put(
  "/profilePicture",
  passport.authenticate("jwt", { session: false }),
  upload.single("profilePicture"),
  updateProfilePicture
);

//UPDATE PROFILE PICTURE
router.put(
  "/backgroundPicture",
  passport.authenticate("jwt", { session: false }),
  upload.single("backgroundPicture"),
  updateBackgroundPicture
);

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

router.get(
  "/google/redirect",
  passport.authenticate("google"),
  fetchUserFromGoogle
);

router.get(
  "/search",
  passport.authenticate("jwt", { session: false }),
  searchUserByName
);

module.exports = router;
