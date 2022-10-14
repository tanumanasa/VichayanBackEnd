const Post = require("../model/post");
const Like = require("../model/like");
const Comment = require("../model/comment");
const Reply = require("../model/reply");
const { ObjectId } = require("mongodb");
const { s3, getSignedUrl, deleteFileFromS3 } = require("../utils/s3");
const { v4: uuidv4 } = require("uuid");
const Tag = require("../model/tag");
const Tagpostmapping = require("../model/tagpostmapping");
const Connection = require("../model/connection");
const Notification = require("../model/notification");
const Report = require("../model/report");

module.exports = {
  createPost: async (req, res) => {
    try {
      const { _id } = req.user;
      let images = [];
      let docs = [];
      if (req.files.images && req.files.images.length > 0) {
        for (var i = 0; i < req.files.images.length; i++) {
          let url = getSignedUrl(req.files.images[i].key);
          images.push({
            id: uuidv4(),
            originalname: req.files.images[i].originalname,
            url: url,
            key: req.files.images[i].key,
          });
        }
      }
      if (req.files.docs && req.files.docs.length > 0) {
        for (var j = 0; j < req.files.docs.length; j++) {
          let url = getSignedUrl(req.files.docs[j].key);
          docs.push({
            id: uuidv4(),
            originalname: req.files.docs[j].originalname,
            url: url,
            key: req.files.docs[j].key,
          });
        }
      }
      const { text, websitesLink, privacy } = req.body;
      const post = new Post({
        text,
        images,
        docs,
        privacy,
        websitesLink,
        createdBy: _id,
      });
      await post.save();

      const connections = await Connection.find({
        $and: [
          { $or: [{ createdBy: ObjectId(_id) }, { recievedBy: ObjectId(_id) }] },
          { status: 'accepted' }
        ]
      })

      await asyncForEach(connections, async (connection) => {

        const userId = _id.toString() === connection.createdBy.toString() ? connection.recievedBy : connection.createdBy;

        const newNotificationRequest = new Notification({
          type: "postCreated",
          message: "Created a post",
          userId: ObjectId(userId),
          createdBy: ObjectId(_id)
        })

        await newNotificationRequest.save()

      });

      //GET ALL TAGS
      //1- if already exist map post with given id
      //2- else create new tag and then map
      const { tags = [] } = req.body;
      for (var k = 0; k < tags.length; k++) {
        const _tag = await Tag.findOne({ tagName: tags[k] });
        if (_tag) {
          //map with newly created postid
          //map post with newly created tag
          const newTagpostmapping = await new Tagpostmapping({
            tagId: _tag._id,
            postId: post._id,
          });
          await newTagpostmapping.save();
        } else {
          //Create new tag
          const newTag = await new Tag({
            tagName: tags[k],
            createdBy: ObjectId(_id),
          });
          await newTag.save();
          //map post with newly created tag
          const newTagpostmapping = await new Tagpostmapping({
            tagId: newTag._id,
            postId: post._id,
          });
          await newTagpostmapping.save();
        }
      }
      return res
        .status(200)
        .json({
          success: true,
          message: "Post created successfully",
          response: post,
        });
    } catch (error) {
      console.log("Error", error);
      return res
        .status(500)
        .json({
          success: false,
          message: "Internal Server Error",
          error: error.message,
        });
    }
  },
  getPost: async (req, res) => {
    try {
      const { id } = req.params;
      const post = await Post.findById(id);
      if (!post) {
        return res
          .status(404)
          .json({
            success: false,
            message: "Invalid id, post not found",
            response: {},
          });
      }
      return res
        .status(200)
        .json({ success: true, message: "Post found", response: post });
    } catch (error) {
      return res
        .status(500)
        .json({
          success: false,
          message: "Internal Server Error",
          error: error.message,
        });
    }
  },
  getPosts: async (req, res) => {
    try {
      const { _id } = req.user;
      const posts = await Post.find({ createdBy: ObjectId(_id) }).populate('createdBy');
      return res
        .status(200)
        .json({
          success: true,
          message: `${posts.length} found`,
          response: posts,
        });
    } catch (error) {
      return res
        .status(500)
        .json({
          success: false,
          message: "Internal Server Error",
          error: error.message,
        });
    }
  },
  updatePost: async (req, res) => {
    try {
      const { id } = req.params;
      let images = [];
      let docs = [];
      if (req.files.images.length > 0) {
        for (var i = 0; i < req.files.images.length; i++) {
          let url = s3.getSignedUrl("getObject", {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: req.files.images[i].key,
          });
          images.push({
            id: uuidv4(),
            originalname: req.files.images[i].originalname,
            url: url,
          });
        }
      }
      if (req.files.docs.length > 0) {
        for (var j = 0; j < req.files.docs.length; j++) {
          let url = s3.getSignedUrl("getObject", {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: req.files.docs[j].key,
          });
          docs.push({
            id: uuidv4(),
            originalname: req.files.docs[j].originalname,
            url: url,
          });
        }
      }
      const { text, websitesLink, privacy } = req.body;
      const post = await Post.findById(id);
      if (!post) {
        return res
          .status(404)
          .json({
            success: false,
            message: "Invalid id, post not found",
            response: {},
          });
      }
      if (text) {
        post.text = text;
      }
      if (images.length > 0) {
        post.images = images;
      }
      if (docs.length > 0) {
        post.docs = docs;
      }
      if (websitesLink) {
        post.websitesLink = websitesLink;
      }
      if (privacy) {
        post.privacy = privacy;
      }
      await post.save();
      return res
        .status(200)
        .json({
          success: true,
          message: "Post updated successfully",
          response: post,
        });
    } catch (error) {
      return res
        .status(500)
        .json({
          success: false,
          message: "Internal Server Error",
          error: error.message,
        });
    }
  },
  deletePost: async (req, res) => {
    try {
      const { id } = req.params;
      const post = await Post.findByIdAndDelete(id);
      if (!post) {
        return res
          .status(404)
          .json({
            success: false,
            message: "Invalid id, post not found",
            response: {},
          });
      }
      for (var i = 0; i < post.images.length; i++) {
        deleteFileFromS3({ key: post.images[i].key }, (d) => {
          if (d.success === false) {
            console.log("Error occured in delete file from s3", d.error);
          } else {
            console.log("Successfully delted from s3 bucket");
          }
        });
      }
      for (var i = 0; i < post.docs.length; i++) {
        deleteFileFromS3({ key: post.images[i].key }, (d) => {
          if (d.success === false) {
            console.log("Error occured in delete file from s3", d.error);
          } else {
            console.log("Successfully delted from s3 bucket");
          }
        });
      }
      return res
        .status(200)
        .json({
          success: true,
          messsage: "Post Deleted successfully",
          response: post,
        });
    } catch (error) {
      return res
        .status(500)
        .json({
          success: false,
          message: "Internal Server Error",
          error: error.message,
        });
    }
  },
  likeUnlikePost: async (req, res) => {
    try {
      const { id } = req.params;
      const { _id } = req.user;
      const like = await Like.findOne({
        $and: [{ createdBy: _id }, { postId: id }],
      }).populate('postId');
      if (like) {
        await Like.findByIdAndDelete(like._id);
        return res
          .status(200)
          .json({
            success: true,
            messsage: "Post unliked successfully",
            response: like,
          });
      }
      const newLike = await new Like({
        postId: id,
        createdBy: _id,
      })
      await newLike.save();

      const post = await Post.findById(id);
      const userId = post.createdBy;

      const newNotificationRequest = await new Notification({
        type: "postLiked",
        message: "Liked a post",
        userId: ObjectId(userId),
        createdBy: ObjectId(_id)
      })

      await newNotificationRequest.save()

      return res
        .status(200)
        .json({
          success: true,
          messsage: "Post liked successfully",
          response: newLike,
        });
    } catch (error) {
      return res
        .status(500)
        .json({
          success: false,
          message: "Internal Server Error",
          error: error.message,
        });
    }
  },
  getLikesOnPost: async (req, res) => {
    try {
      const { id } = req.params;
      const likes = await Like.find({ postId: id });
      return res
        .status(200)
        .json({
          success: true,
          message: `${likes.length} likes on given post`,
          response: likes,
        });
    } catch (error) {
      return res
        .status(500)
        .json({
          success: false,
          message: "Internal Server Error",
          error: error.message,
        });
    }
  },
  getCommentsOnPost: async (req, res) => {
    try {
      const { id } = req.params;
      const comments = await Comment.find({ postId: id });
      return res
        .status(200)
        .json({
          success: true,
          message: `${comments.length} comments on given post`,
          response: comments,
        });
    } catch (error) {
      return res
        .status(500)
        .json({
          success: false,
          message: "Internal Server Error",
          error: error.message,
        });
    }
  },
  getCommentsCountOnPost: async (req, res) => {
    try {
      const {id} = req.params;
      const count = await Comment.countDocuments({postId: id});
      console.log("🚀 ~ file: post.js ~ line 389 ~ getCommentsCountOnPost: ~ count", count)
      return res
        .status(200)
        .json({
          success: true,
          message: `${count} comments on given post`,
          response: {
            count
          }
        })
    } catch (error) {
      return res
        .status(500)
        .json({
          success: false,
          message: "Internal Server Error",
          error: error.message,
        });
    }
  },
  commentOnPost: async (req, res) => {
    try {
      const { id } = req.params;
      const { _id } = req.user;
      const { comment } = req.body;
      const newComment = await new Comment({
        comment,
        postId: id,
        createdBy: _id,
      });
      await newComment.save();

      const post = await Post.findById(id);
      const userId = post.createdBy;

      const newNotificationRequest = await new Notification({
        type: "postCommented",
        message: "Comented a post",
        userId: ObjectId(userId),
        createdBy: ObjectId(_id)
      })

      await newNotificationRequest.save();
      return res
        .status(200)
        .json({
          success: false,
          message: "Commented successfully",
          response: newComment,
        });
    } catch (error) {
      return res
        .status(500)
        .json({
          success: false,
          message: "Internal Server Error",
          error: error.message,
        });
    }
  },
  deleteComment: async (req, res) => {
    try {
      const { _id } = req.user;
      const { id } = req.params;
      const comment = await Comment.findByIdAndDelete(id);
      if (!comment) {
        return res
          .status(404)
          .json({ success: false, message: "Invalid id", response: {} });
      }
      return res
        .status(200)
        .json({
          success: true,
          message: "Comment deleted successfully",
          response: comment,
        });
    } catch (error) {
      return res
        .status(500)
        .json({
          success: false,
          message: "Internal Server Error",
          error: error.message,
        });
    }
  },
  updateComment: async (req, res) => {
    try {
      const {_id} = req.user;
      const {id} = req.params;
      const {comment} = req.body;
      const newComment = await Comment.findByIdAndUpdate(id, {comment}, {new: true});
      if(!newComment){
        return res
        .status(404)
        .json({ success: false, message: "Invalid id", response: {} });
      }
      return res
        .status(200)
        .json({
          success: true,
          message: "Comment updated successfully",
          response: newComment,
        });
    } catch (error) {
      return res
      .status(500)
      .json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  },
  mostLikedPost: async (req, res) => {
    try {
      let pipeline = [
        {
          $group: {
            _id: "$postId",
            count: { $sum: 1 },
            data: { $push: "$$ROOT" },
          },
        },
      ];
      const data = await Like.aggregate(pipeline);
      return res
        .status(200)
        .json({
          success: true,
          message: "Here is the most liked comment",
          response: data,
        });
    } catch (error) {
      return res
        .status(500)
        .json({
          success: false,
          message: "Internal Server Error",
          error: error.message,
        });
    }
  },
  getAllPostOfaTag: async (req, res) => {
    try {
      const { id } = req.params;
      const posts = await Tagpostmapping.find({ tagId: ObjectId(id) }).populate(
        "postId"
      );
      const tag = await Tag.findById(ObjectId(id));
      return res
        .status(200)
        .json({
          message: `${posts.length} post found successfully`,
          success: true,
          response: { tag, posts },
        });
    } catch (error) {
      return res
        .status(500)
        .json({
          success: false,
          message: "Internal Server Error",
          error: error.message,
        });
    }
  },
  getAllPostofMultipleTags: async (req, res) => {
    try {
      let { tags } = req.body;
      const posts = await Tagpostmapping.find({
        tagId: { $in: tags },
      }).populate("tagId postId");
      return res
        .status(200)
        .json({
          message: `${posts.length} post found successfully`,
          success: true,
          response: posts,
        });
    } catch (error) {
      return res
        .status(500)
        .json({
          success: false,
          message: "Internal Server Error",
          error: error.message,
        });
    }
  },
  getAllTags: async (req, res) => {
    try {
      const { id } = req.params;
      const tags = await Tag.find({ createdBy: ObjectId(id) });
      return res
        .status(200)
        .json({
          message: `${tags.length} tags found successfully`,
          success: true,
          response: tags,
        });
    } catch (error) {
      return res
        .status(500)
        .json({
          success: false,
          message: "Internal Server Error",
          error: error.message,
        });
    }
  },
  getAllPostOfConnections: async (req, res) => {
    try {
      const { _id } = req.user;
      // const _id = "61308dc46f905d4d4c757f5f"
      //GET ALL CONNECTIONS
      const connections = await Connection.find({
        $or: [{ user1: ObjectId(_id) }, { user2: ObjectId(_id) }],
      });
      //GET THEIR POST
      if (connections.length == 0) {
        //No any connection found
        return res
          .status(404)
          .json({
            message: "No connections found",
            success: false,
            response: {},
          });
      }
      //Get all connections post
      let response = [];
      for (var i = 0; i < connections.length; i++) {
        if (connections[i].user1.toString() != _id.toString()) {
          const _p1 = await Post.find({
            createdBy: ObjectId(connections[i].user1),
          }).populate("createdBy");
          response = [..._p1];
        }
        if (connections[i].user2.toString() != _id.toString()) {
          const _p2 = await Post.find({
            createdBy: ObjectId(connections[i].user2),
          }).populate("createdBy");
          response = [..._p2];
        }
      }
      response.sort(function (a, b) {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      return res
        .status(200)
        .json({
          message: "Here is the post of all connections",
          success: false,
          response,
        });
    } catch (error) {
      return res
        .status(500)
        .json({
          success: false,
          message: "Internal Server Error",
          error: error.message,
        });
    }
  },
  //get reply on  a comment
  getrepliesOnComment: async (req, res) => {
    try {
      const { id } = req.params;
      const replies = await Reply.find({ commentId: id });
      return res
        .status(200)
        .json({
          success: true,
          message: `${replies.length} replies on given comment`,
          response: replies,
        });
    } catch (error) {
      return res
        .status(500)
        .json({
          success: false,
          message: "Internal Server Error",
          error: error.message,
        });
    }
  },
  //do reply on a comment
  repliesOnComment: async (req, res) => {
    try {
      const { id } = req.params;
      const { _id } = req.user;
      const { reply } = req.body;

      const newReply = await new Reply({
        reply,
        commentId: id,

        createdBy: _id,
      });
      await newReply.save();
      return res
        .status(200)
        .json({
          success: true,
          message: "Commented successfully",
          response: newReply,
        });
    } catch (error) {
      return res
        .status(500)
        .json({
          success: false,
          message: "Internal Server Error",
          error: error.message,
        });
    }
  },
  //delete a reply
  deleteReply: async (req, res) => {
    try {
      const { _id } = req.user;
      const { id } = req.params;
      const reply = await Reply.findByIdAndDelete(id);
      if (!reply) {
        return res
          .status(404)
          .json({ success: false, message: "Invalid id", response: {} });
      }
      return res
        .status(200)
        .json({
          success: true,
          message: "Reply deleted successfully",
          response: reply,
        });
    } catch (error) {
      return res
        .status(500)
        .json({
          success: false,
          message: "Internal Server Error",
          error: error.message,
        });
    }
  },
  //set privacy of a post
  setPrivacy: async (req, res) => {
    try {
      const { id } = req.params;
      const { privacy } = req.body;
      const post = await Post.findOneAndUpdate({ _id: id, createdBy: req.user.id }, { privacy }, { new: true });
      return res.status(200).json({
        success: true,
        message: "Post privacy upadated",
        response: post
      })
    } catch (error) {
      return res
        .status(500)
        .json({
          success: false,
          message: "Internal Server Error",
          error: error.message,
        });
    }
  },
  //report a post
  reportPost: async (req, res) => {
    try {
      const {_id} = req.user;
      const {id} = req.params;
      const post = await Post.findById(id);
      if(!post){
        return res.status(404).json({
          success: false,
          message: "Post not found",
          response: {}
        });
      }
      const reported = await Report.findOne({postId: id, createdBy: _id});
      if(reported){
        return res.status(400).json({
          success: false,
          message: "You have already reported this post",
          response: {}
        });
      }
      const newReport = new Report({
        postId: id,
        createdBy: _id
      });
      await newReport.save();
      // post.reportCount = post.reportCount + 1;
      // await post.save();
      // if(post.reportCount >= 10){
      //   console.log("way too many reports, gotta take it down");
      //   await Post.findByIdAndDelete(id);
        //you can't just delete a post and leave all its related stuff like files and images linked with it, delete them too
      //   await Report.deleteMany({postId: id});
      //   console.log(postToTakeDown);
      // }
      return res.status(200).json({
        success: true,
        message: "Post reported successfully",
        response: newReport
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message
      });
    }
  }
};

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index += 1) {
    // eslint-disable-next-line no-await-in-loop
    await callback(array[index], index, array);
  }
}