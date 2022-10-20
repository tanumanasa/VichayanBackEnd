const express = require('express');
const { globalSearch } = require('../controller/search');
const router = express.Router();

router.post('/globalSearch', globalSearch);

module.exports = router;