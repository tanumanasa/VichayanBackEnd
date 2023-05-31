const express = require("express");
const passport = require("passport");
const router = express.Router();
// const { sendEmail }=require("../controller/generateotp")

const {
    chatCreation
  } = require("../controller/chat");

//USER REGISTER
router.post("/create", passport.authenticate("jwt", { session: false }), chatCreation);
// router.post('/otp', sendEmail)

module.exports = router;