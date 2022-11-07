const express = require('express');
const router = express.Router();
const passport = require('passport');
const { addStroy, getAllStories, getStory, deleteStory} = require('../controller/story');
const { upload } = require("../utils/s3");

router.post('/', passport.authenticate('jwt', {session: false}), upload.single('story'), addStroy);
router.get('/:userId', getAllStories);
router.get('/single/:storyId', getStory);
router.delete('/:storyId', passport.authenticate('jwt', {session: false}), deleteStory);

module.exports = router;