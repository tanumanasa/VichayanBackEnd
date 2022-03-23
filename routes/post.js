const express = require("express");
const router = express.Router();
const passport = require("passport");
const { upload } = require("../utils/s3");

const {
  createPost,
  getPost,
  getPosts,
  updatePost,
  deletePost,
  likeUnlikePost,
  getLikesOnPost,
  commentOnPost,
  getCommentsOnPost,
  deleteComment,
  mostLikedPost,
  getAllPostOfaTag,
  getAllPostofMultipleTags,
  getAllTags,
  getAllPostOfConnections,
  deleteReply,
  repliesOnComment,
  getrepliesOnComment,
} = require("../controller/post");

//CREATE POST
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  upload.fields([
    { name: "images", maxCount: 5 },
    { name: "docs", maxCount: 5 },
  ]),
  createPost
);

//GET POST
router.get(
  "/single/:id",
  passport.authenticate("jwt", { session: false }),
  getPost
);

//GET POSTS
router.get("/", passport.authenticate("jwt", { session: false }), getPosts);

//UPDATE POST
router.put(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  upload.fields([
    { name: "images", maxCount: 5 },
    { name: "docs", maxCount: 5 },
  ]),
  updatePost
);

//DELETE POST
router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  deletePost
);

//LIKE UNLIKE POST
router.get(
  "/react/:id",
  passport.authenticate("jwt", { session: false }),
  likeUnlikePost
);

//LIKES ON POST
router.get(
  "/like/:id",
  passport.authenticate("jwt", { session: false }),
  getLikesOnPost
);

//COMMENT ON POST
router.post(
  "/comment/:id",
  passport.authenticate("jwt", { session: false }),
  commentOnPost
);

//GET COMMENT ON POST
router.get(
  "/comment/:id",
  passport.authenticate("jwt", { session: false }),
  getCommentsOnPost
);

//DELETE COMMENT
router.delete(
  "/comment/:id",
  passport.authenticate("jwt", { session: false }),
  deleteComment
);

//MOST LIKED POSTs
router.get("/mostLiked", mostLikedPost);

//GET ALL POST OF A SINGLE TAG
router.get(
  "/tag/:id",
  passport.authenticate("jwt", { session: false }),
  getAllPostOfaTag
);

//GET ALL POST OF MULTIPLE TAG
router.post(
  "/tag",
  passport.authenticate("jwt", { session: false }),
  getAllPostofMultipleTags
);

//GET ALL TAGS
router.get(
  "/user/tag/:id",
  passport.authenticate("jwt", { session: false }),
  getAllTags
);

//GET ALL POST OF CONNECTIONS
router.get(
  "/user",
  passport.authenticate("jwt", { session: false }),
  getAllPostOfConnections
);

//Reply ON COmment
router.post(
  "/reply/:id",
  passport.authenticate("jwt", { session: false }),
  repliesOnComment
);

//GET reply on a post
router.get(
  "/reply/:id",
  passport.authenticate("jwt", { session: false }),
  getrepliesOnComment
);

//DELETE reply
router.delete(
  "/reply/:id",
  passport.authenticate("jwt", { session: false }),
  deleteReply
);

module.exports = router;
