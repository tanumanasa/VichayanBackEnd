const express = require("express");
const passport = require("passport");
const router = express.Router();

const {
    chatCreation
  } = require("../controller/chat");

//USER REGISTER
router.post("/create", passport.authenticate("jwt", { session: false }), chatCreation);

module.exports = router;