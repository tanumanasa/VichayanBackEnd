const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    desc: {
      type: String,
      max: 500,
    },
    img: {
      type: String,
    },
    likes:[
      {
          user:{
              type:mongoose.Schema.Types.ObjectId,
              ref:'User'
          }
      }
  ],
    comments: [
      {
          type: mongoose.Schema.Types.ObjectId,
          ref:'Comment'
      }
  ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", PostSchema);
