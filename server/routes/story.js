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
  .post(
    /* upload.single("storyImage"), */ isLoggedIn,
    storyController.saveStory
  );

router
  .route("/updateLike")
  .post(
    /* upload.single("storyImage"), */ isLoggedIn,
    storyController.updateLike
  );

module.exports = router;
