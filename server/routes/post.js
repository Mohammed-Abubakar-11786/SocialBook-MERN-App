const express = require("express");
const router = express.Router();
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });
const passport = require("passport");
const { isLoggedIn, isLoggedInForAjax } = require("../middleware.js");

const postController = require("../controller/post.js");

//to create new post form
router.post("/newpost", isLoggedIn, postController.renderNewPostForm);
router.post("/sendPost/:post_ID", postController.sendPost);

router.get("/incLike/:id/:currUser", postController.incrementLike);
router.post(
  "/newPostAllDetails",
  isLoggedIn,
  /* upload.single("post[image]"), */
  postController.saveNewPost
);
router.post(
  "/saveCmt/:post_id/:currUser_id",
  // isLoggedInForAjax,
  postController.saveCmt
);
module.exports = router;
