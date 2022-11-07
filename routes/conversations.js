const router = require("express").Router();
const mongoose = require("mongoose");
const passport = require("passport");
const Conversation = require("../model/Conversation");
const {upload, getSignedUrl} = require('../utils/s3');
//new conv

router.post("/:id",passport.authenticate("jwt", {session:false}) , async (req, res) => {
  const senderId = req.user._id;
  const receiverId = mongoose.Types.ObjectId(req.params.id);
  const newConversation = new Conversation({
    members: [senderId, receiverId],
  });
  try {
    const conversation = await Conversation.findOne({
      members: { $all: [senderId, receiverId] },
    });
    if (!conversation) {
      const savedConversation = await newConversation.save();
      res.status(200).json({
        message: "Conversation created successfully !!",
        success: true,
        response: savedConversation,
      });
    } else {
      res.status(409).json({
        message: "Conversation already exists !!",
        success: false,
      });
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

//get conv of a user

router.get("/:userId", async (req, res) => {
  try {
    const conversation = await Conversation.find({
      members: { $in: [req.params.userId] },
    });
    res.status(200).json({
      success: true,
      message: "Conversations Found !!",
      response: conversation,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

// get conv includes two userId

router.get("/find/:firstUserId/:secondUserId", async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      members: { $all: [req.params.firstUserId, req.params.secondUserId] },
    });
    res.status(200).json({
      success: true,
      message: "Conversations Found !!",
      response: conversation,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post('/chatBackground/:conversationId', passport.authenticate('jwt', {session: false}), upload.single('chatBackground'),  async(req, res) => {
  try {
    const {id} = req.user;
    const {conversationId: _id} = req.params;
    let chatBackground;
    if(req.file){
      let url = getSignedUrl(req.file.key);
      chatBackground = {
        originalname: req.file.originalname,
        url,
        key: req.file.key
      };
    }
    console.log(chatBackground);
    const conversation = await Conversation.findOneAndUpdate({_id, members: {"$in": [mongoose.Types.ObjectId(id)]}}, {chatBackground}, {new: true});
    if(!conversation){
      return res.status(404).json({
        success: false,
        message: 'No conversation found with provided conversationId',
        response: {}
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Chat background changed successfully',
      response: conversation
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message 
    })
  }
})

module.exports = router;
