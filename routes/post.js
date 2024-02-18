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

router.get(
  "/incLike/:id/:currUser",
  isLoggedInForAjax,
  postController.incrementLike
);
router.post(
  "/newPostAllDetails",
  /* upload.single("post[image]"), */
  postController.saveNewPost
);
router.post(
  "/saveCmt/:post_id/:currUser_id",
  isLoggedInForAjax,
  postController.saveCmt
);
module.exports = router;
