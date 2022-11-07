const router = require("express").Router();
const Message = require("../model/Message");
const fs = require("fs");
//multer config
const multer = require("multer");
const DIR = "./uploads/";
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg"
    ) {
      fs.mkdirSync(DIR + "photos/", { recursive: true });
      cb(null, DIR + "photos/");
    } else if (
      file.mimetype == "video/mp4" ||
      file.mimetype == "video/3gpp" ||
      file.mimetype == "video/quicktime" ||
      file.mimetype == "video/x-flv" ||
      file.mimetype == "application/x-mpegURL" ||
      file.mimetype == "video/MP2T" ||
      file.mimetype == "video/x-msvideo" ||
      file.mimetype == "video/x-ms-wmv"
    ) {
      fs.mkdirSync(DIR + "videos/", { recursive: true });
      cb(null, DIR + "videos/");
    } else {
      fs.mkdirSync(DIR + "documents/", { recursive: true });
      cb(null, DIR + "documents/");
    }
  },
  filename: (req, file, cb) => {
    const fileName = file.originalname.toLowerCase().split(" ").join("-");
    cb(null, fileName);
  },
});
const upload = multer({
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 },
}).single("file");
//filehandler
const {
  uploadFile,
  deleteFile,
  downloadFile,
  cdnLinkGenerator,
} = require("../utils/Filehandler");
const passport = require("passport");
const Conversation = require("../model/Conversation");
//add

// router.post("/", upload, async (req, res) => {
//   console.log(req.file);
//   try {
//     if (!req.file) {
//       const newMessage = new Message(req.body);
//       const savedMessage = await newMessage.save();
//       res.status(200).json(savedMessage);
//     } else {
//       await uploadFile(req, res);
//     }
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

//get
router.get("/:conversationId", async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json(err);
  }
});

//send message
router.post('/', passport.authenticate("jwt", {session: false}), async(req, res) => {
  try {
    const {conversationId, text} = req.body;
    const senderId = req.user._id;
    const conversation = await Conversation.findOne({_id: conversationId, members: { $in : [senderId]}});
    if(!conversation){
      return res.status(400).json({
        succcess: false,
        messages: "Conversation not found",
        response: {}
      })
    }
    const message = new Message({
      conversationId,
      senderId,
      text,
      status: sent
    })
    await message.save();
    return res.status(200).json({
      success: true,
      message: "Message sent",
      response: message
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    })
  }
});

router.delete('/:id', passport.authenticate("jwt", {session: false}), async(req, res) => {
  try {
    const {id} = req.params;
    const {conversationId} = req.body;
    const senderId = req.user._id;
    const message = await Message.findOneAndDelete({_id: id, senderId, conversationId});
    if(!message){
      return res.status(400).json({
        success: false,
        message: "Message not found",
        response: {}
      })
    }
    return res.status(200).json({
      succcess: true,
      message: "Message deleted successfully",
      response: message
    })
  } catch (error) {
    return res.status(500).json({
      succcess: false,
      message: 'Internal server error',
      error: error.message
    })
  }
});


router.put('/received/:messageId', passport.authenticate('jwt', {session: false}), async(req, res) => {
  try {
    const {id} = req.user;
    const {messageId} = req.params;
    const {conversationId} = req.body;
    const message = await Message.findOneAndUpdate({_id: messageId, conversationId}, {status: 'received'}, {new: true});
    if(!message){
      return res.status(400).json({
        success: false,
        message: 'No message found with provided meessageId',
        response: {}
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Message seen successfully',
      respnose: message
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

router.put('/seen/:messageId', passport.authenticate('jwt', {session: false}), async(req, res) => {
  try {
    const {id} = req.user;
    const {messageId} = req.params;
    const {conversationId} = req.body;
    const message = await Message.findOneAndUpdate({_id: messageId, conversationId}, {status: 'seen'}, {new: true});
    if(!message){
      return res.status(400).json({
        success: false,
        message: 'No message found with provided meessageId',
        response: {}
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Message received successfully',
      respnose: message
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});



module.exports = router;
