const File = require("../model/Message");
// include node fs module
const fs = require("fs");
// const download = require("download");

async function uploadFile(req, res) {
  const file = req.file;
  console.log(file);
  // create a new file
  let fileNotExists = await validateFilePath(file.path);
  if (fileNotExists) {
    const newFile = new File({
      ...file,
      ...req.body,
    });

    await newFile.save();
    return res.status(201).json({
      message: newFile,
      success: true,
    });
  } else {
    return res.status(400).json({
      message: "This file already exists !!",
      success: false,
    });
  }
}

async function deleteFile(req, res) {
  const path = req.body.path;
  await fs.unlinkSync(path);
  console.log("File deleted!");

  // create a new file
  let file = await File.deleteOne({ path })
    .then(function () {
      return res.status(201).json({
        message: "Your file has been successfully deleted !!",
        success: true,
      });
    })
    .catch(function (error) {
      console.log(error); // Failure
      return res.status(400).json({
        message: "Something went wrong !!",
        success: false,
      });
    });
}

async function downloadFile(req, res) {
  const file = req.body.path;
  return res.download(file);
}

async function cdnLinkGenerator(req, res) {
  const path = req.body.path;
  const filetype = extractFiletype(path);
  const filename = extractFilename(path);
  const token = req.user.token;
  if (filetype === js) {
    return res.status(201).json({
      message: `<script
      src="http://localhost:5000/api/users/js/${filename}?access_token=${token}">
      </script>`,
      success: true,
    });
  }
  if (filetype === css) {
  }
  if (filetype === pdf) {
  }
  if (filetype === png || filetype === jpeg || filetype === jpg) {
  }
}

const validateFilePath = async (path) => {
  let file = await File.findOne({ path });
  return file ? false : true;
};

const extractFilename = (path) => {
  const pathArray = path.split("/");
  return pathArray.pop();
};
const extractFiletype = (path) => {
  const filename = extractFilename(filePath);
  const fileNameArray = filename.split(".");
  return fileNameArray.pop();
};

module.exports = {
  uploadFile,
  deleteFile,
  downloadFile,
  cdnLinkGenerator,
};
