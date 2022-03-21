const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const multer = require("multer");
const userRoute = require("./routes/users");
const authRoute = require("./routes/auth");
const postRoute = require("./routes/posts");
const conversationRoute = require("./routes/conversations");
const messageRoute = require("./routes/messages");
const cors = require("cors");
const path = require("path");

dotenv.config();

mongoose.connect(
  // "mongodb://localhost:27017/vichayan1",
  "mongodb+srv://bikash:bikash@cluster0.eorqc.mongodb.net/vichayan?retryWrites=true&w=majority",
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => {
    console.log("Connected to MongoDB");
  }
);
app.use("/images", express.static(path.join(__dirname, "public/images")));

//middleware
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));
app.use(cors());
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images");
  },
  filename: (req, file, cb) => {
    cb(null, req.body.name);
  },
});

const upload = multer({ storage: storage });
app.post("/api/upload", upload.single("file"), (req, res) => {
  try {
    return res.status(200).json("File uploded successfully");
  } catch (error) {
    console.error(error);
  }
});

//all routes
app.use("/api/auth", require("./routes/auth"));

app.use("/api/users", userRoute);
app.use("/api/posts", postRoute);
app.use("/api/conversations", conversationRoute);
app.use("/api/messages", messageRoute);

// start server
app.listen(8800, () => {
  console.log("Backend server is running!");
});
