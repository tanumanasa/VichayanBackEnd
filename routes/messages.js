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
//add

router.post("/", upload, async (req, res) => {
  console.log(req.file);
  try {
    if (!req.file) {
      const newMessage = new Message(req.body);
      const savedMessage = await newMessage.save();
      res.status(200).json(savedMessage);
    } else {
      await uploadFile(req, res);
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

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

module.exports = router;
