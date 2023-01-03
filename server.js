const http = require("http");
const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const cors = require("cors");
const socketio = require("socket.io");

// socket configuration
const { webSockets } = require("./utils/websockets");

const dotenv = require("dotenv");
dotenv.config();

const morgan = require("morgan");

//MIDDILWARES
const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(morgan("dev"));

// Passport Middleware
app.use(passport.initialize());

// Passport Config.
require("./config/passport")(passport);

app.get("/", (req, res) => {
  return res.status(200).json({ message: "Welcome to Vichayan dev db" });
});

//ROUTES
app.use("/dev/api/v1/user", require("./routes/user"));
app.use("/dev/api/v1/experience", require("./routes/experience"));
app.use("/dev/api/v1/education", require("./routes/education"));
app.use("/dev/api/v1/post", require("./routes/post"));
app.use("/dev/api/v1/article", require("./routes/article"));
app.use("/dev/api/v1/connection", require("./routes/connection"));
app.use("/dev/api/v1/notification", require("./routes/notification"));
app.use("/dev/api/v1/chat", require("./routes/chat"));
app.use(
  "/dev/api/v1/conversations",
  passport.authenticate("jwt", { session: false }),
  require("./routes/conversations")
);
app.use(
  "/dev/api/v1/messages",
  passport.authenticate("jwt", { session: false }),
  require("./routes/messages")
);

//Catching 404 Error
app.use((req, res, next) => {
  const error = new Error("INVALID ROUTE");
  error.status = 404;
  next(error);
});

//Error handler function
app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    },
  });
});

const PORT = process.env.PORT || 5000;
// mongoose
//   .connect("mongodb://10.0.1.156:27017/vichayan", {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//     useCreateIndex: true,
//     useFindAndModify: false,
//   })
//   .then(() => {
//     console.log("DB connected ");

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log("DB connected ");


  /** Create HTTP server. */
  const server = http.createServer(app);

  /** Create socket connection */
  global.io = socketio.listen(server);
  global.io.on('connection', webSockets.connection)
  console.log("WebSockets connected ");

  server.listen(PORT, () => {
    console.log(`Server is Running at port ${PORT}`);
  });
  })
  .catch((err) => {
    console.log("Error in connecting to DataBase", err.message);
  });

//

// mongodb://127.0.0.1:27017/servimate

// "start": "pm2-runtime start ecosystem.config.js --env production"
