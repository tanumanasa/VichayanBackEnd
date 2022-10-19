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
  setPrivacy,
  updateComment,
  getCommentsCountOnPost,
  reportPost,
  getPostByInterest,
  getTopPostByInterest,
} = require("../controller/post");

//CREATE POST 1
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  upload.fields([
    { name: "images", maxCount: 5 },
    { name: "docs", maxCount: 5 },
  ]),
  createPost
);

//GET POST 2
router.get(
  "/single/:id",
  passport.authenticate("jwt", { session: false }),
  getPost
);

//GET POSTS 3
router.get("/", passport.authenticate("jwt", { session: false }), getPosts);

//UPDATE POST 12
router.put(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  upload.fields([
    { name: "images", maxCount: 5 },
    { name: "docs", maxCount: 5 },
  ]),
  updatePost
);

//DELETE POST 9
router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  deletePost
);

//LIKE UNLIKE POST 4
router.get(
  "/react/:id",
  passport.authenticate("jwt", { session: false }),
  likeUnlikePost
);

//LIKES ON POST 6
router.get(
  "/like/:id",
  passport.authenticate("jwt", { session: false }),
  getLikesOnPost
);

//COMMENT ON POST 5
router.post(
  "/comment/:id",
  passport.authenticate("jwt", { session: false }),
  commentOnPost
);

//GET COMMENT ON POST 7 
router.get(
  "/comment/:id",
  passport.authenticate("jwt", { session: false }),
  getCommentsOnPost
);

//GET COMMENT COUNT ON POST 15
router.get(
  "/commentcount/:id",
  passport.authenticate("jwt", { session: false }),
  getCommentsCountOnPost
);


//UPDATE COMMENT ON POST 16
router.put(
  "/comment/:id",
  passport.authenticate("jwt", { session: false}),
  updateComment
)

//DELETE COMMENT 17
router.delete(
  "/comment/:id",
  passport.authenticate("jwt", { session: false }),
  deleteComment
);

//MOST LIKED POST 8
router.get("/mostLiked", mostLikedPost);

//GET ALL POST OF A SINGLE TAG 18
router.get(
  "/tag/:id",
  passport.authenticate("jwt", { session: false }),
  getAllPostOfaTag
);

//GET ALL POST OF MULTIPLE TAG 19
router.post(
  "/tag",
  passport.authenticate("jwt", { session: false }),
  getAllPostofMultipleTags
);

//GET ALL TAGS 20
router.get(
  "/user/tag/:id",
  passport.authenticate("jwt", { session: false }),
  getAllTags
);

//GET ALL POST OF CONNECTIONS 21
router.get(
  "/user",
  passport.authenticate("jwt", { session: false }),
  getAllPostOfConnections
);

//Reply ON Comment 22
router.post(
  "/reply/:id",
  passport.authenticate("jwt", { session: false }),
  repliesOnComment
);

//GET reply on a comment 23
router.get(
  "/reply/:id",
  passport.authenticate("jwt", { session: false }),
  getrepliesOnComment
);

//DELETE reply 24
router.delete(
  "/reply/:id",
  passport.authenticate("jwt", { session: false }),
  deleteReply
);

//UPDATE privacy 10
router.put(
  "/privacy/:id",
  passport.authenticate("jwt", { session: false }),
  setPrivacy
)

//REPORT post 11
router.put(
  '/report/:id',
  passport.authenticate("jwt", {session: false}),
  reportPost
)

//get posts by interests 13
router.get(
  '/interests',
  passport.authenticate("jwt", {session: false}),
  getPostByInterest
)

//get top post by interests 14
router.get(
  '/interests/:interest',
  passport.authenticate("jwt", {session: false}),
  getTopPostByInterest
)

module.exports = router;
