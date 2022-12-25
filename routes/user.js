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
  addInterests,
  removeInterests,
  setPremium,
  followUser,
  fetchInterests,
  syncContacts,
  forgotPassword,
  resetPassword,
  addEducationOfUser,
  addExperienceOfUser,
  addAboutOfUser,
  getAboutOfUser,
  addSkillsOfUser,
  getSkillsOfUser,
  updateSkillsUser,
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

//Forgot password
router.put("/forgotPassword", forgotPassword);

//Forgot password
router.put("/forgotPassword",
 passport.authenticate("jwt", { session: false }),
  resetPassword);

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

//fetch all available interests
router.get(
  "/interests",
  passport.authenticate("jwt", {session: false}),
  fetchInterests
)


//add Interests
router.post(
  "/interests",
  passport.authenticate("jwt", {session:false}),
  addInterests
)

//remove Interests
router.delete(
  "/interests",
  passport.authenticate("jwt", {session:false}),
  removeInterests
)

//add Education
router.post(
  "/educations",
  passport.authenticate("jwt", {session:false}),
  addEducationOfUser
)

//add Experience
router.post(
  "/experiences",
  passport.authenticate("jwt", {session:false}),
  addExperienceOfUser
)

//add About
router.post(
  "/about",
  passport.authenticate("jwt", {session:false}),
  addAboutOfUser
)

//add About
router.get(
  "/about",
  passport.authenticate("jwt", {session:false}),
  getAboutOfUser
)

// Skills
router.get(
  "/skills",
  passport.authenticate("jwt", {session:false}),
  getSkillsOfUser
)

router.post(
  "/skills",
  passport.authenticate("jwt", {session:false}),
  addSkillsOfUser
)

router.put(
  "/skills",
  passport.authenticate("jwt", {session:false}),
  updateSkillsUser
)

//UPDATE COMMENT ON POST




//set premium
router.put(
  "/premium",
  passport.authenticate("jwt", {session: false}),
  setPremium
)

//follow user
router.post(
  "/follow/:id",
  passport.authenticate("jwt",{session: false}),
  followUser
)

//sync contacts
router.post(
  '/sync',
  passport.authenticate("jwt", {session: false}),
  syncContacts
)

module.exports = router;
