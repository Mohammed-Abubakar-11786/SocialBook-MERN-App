const express = require("express");
const router = express.Router();
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });
const passport = require("passport");
const { isLoggedIn } = require("../middleware.js");

const postController = require("../controller/post.js");

//to create new post form
router.post("/newpost", isLoggedIn, postController.renderNewPostForm);

router.post(
  "/newPostAllDetails",
  upload.single("post[image]"),
  postController.saveNewPost
);
module.exports = router;
