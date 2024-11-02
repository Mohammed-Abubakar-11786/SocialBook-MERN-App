const express = require("express");
const router = express.Router();
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });
const passport = require("passport");
const { isLoggedIn, isLoggedInForAjax } = require("../middleware.js");

const postController = require("../controller/post.js");

//to create new post form
router.post("/newpost", isLoggedIn, postController.renderNewPostForm); // not being used
router.post("/sendPost/:post_ID", isLoggedIn, postController.sendPost); // not being used

router.get("/incLike/:id/:currUser", postController.incrementLike);
// Route to save a new post with passports unautherized error handleing...
router.post(
  "/newPostAllDetails",
  isLoggedIn,
  /* upload.single("post[image]"), */ // Uncomment this line if needed for handling file uploads
  postController.saveNewPost
);

router.post(
  "/saveCmt/:post_id/:currUser_id",
  isLoggedIn,
  postController.saveCmt
);
module.exports = router;
