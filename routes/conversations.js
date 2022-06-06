const router = require("express").Router();
const Conversation = require("../model/Conversation");

//new conv

router.post("/", async (req, res) => {
  const newConversation = new Conversation({
    members: [req.body.senderId, req.body.receiverId],
  });

  try {
    const conversation = await Conversation.findOne({
      members: { $all: [req.params.firstUserId, req.params.secondUserId] },
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

module.exports = router;
