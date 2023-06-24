const express = require("express");
const router = express.Router();
const { sendEmail } = require('../controller/generateotp')

router.post('/otp', sendEmail)

module.exports = router;