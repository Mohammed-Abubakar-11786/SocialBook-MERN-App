const express = require("express");
const router = express.Router();
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });
const passport = require("passport");
const { isLoggedIn } = require("../middleware.js");

const storyController = require("../controller/story.js");

//to create new post form
router
  .route("/newStory")
  .get(isLoggedIn, storyController.renderStoryForm)
  .post(/* upload.single("storyImage"), */ storyController.saveStory);

module.exports = router;
