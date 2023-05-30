const express = require("express");
const router = express.Router();
const { sendEmail }=require('../controller/generateotp')

router.post('/sendemail', sendEmail)

module.exports = router;