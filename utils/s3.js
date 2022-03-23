var aws = require('aws-sdk')
var multer = require('multer')
var multerS3 = require('multer-s3')

var s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
})

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString())
    }
  })
})


const getSignedUrl = (key) => {
  let url = s3.getSignedUrl('getObject', {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key
  })
  return url

}

const deleteFileFromS3 = (req, cb) => {
  var params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: req.key
  };
  s3.deleteObject(params, function (err, data) {
    if (err) {
      cb(() => {
        return {
          success: false,
          error: err
        }
      })
      console.log(err, err.stack); // an error occurred
    }
    else {
      cb(() => {
        return {
          success: true
        }
      })
    }
  });

}

module.exports = { upload, s3, deleteFileFromS3, getSignedUrl }


