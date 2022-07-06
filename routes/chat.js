const express = require("express");
const router = express.Router();

const {
    chatCreation
  } = require("../controller/chat");

//USER REGISTER
router.post("/create", chatCreation);

module.exports = router;