const express = require("express");
const router = express.Router();
const multer = require("multer");
const { storage, cloudinary } = require("../cloudConfig.js");
const upload = multer({ storage });

const { isLoggedIn, isSame, isEmptyMsg } = require("../middleware.js");

const groupChatsController = require("../controller/groupChats.js");

router // not being used
  .route("/saveNewGroupUsers/:currUserID")
  .post(
    isLoggedIn,
    /* upload.single("chatImg"), */ groupChatsController.saveNewGroupUsers
  );

router // not being used
  .route("/saveNewGroupDetails/:currUserID")
  .post(
    isLoggedIn,
    /* upload.single("chatImg"), */ groupChatsController.saveNewGroupDetails
  );

router
  .route("/deleteGroup/:grpId")
  .get(isLoggedIn, groupChatsController.deleteGroup);

router
  .route("/getGroupContent/:grpId")
  .get(isLoggedIn, groupChatsController.getGroupContent);

router
  .route("/saveGroupMsg/:currUserID/:grpId")
  .post(isLoggedIn, groupChatsController.saveGrpMsg);

module.exports = router;
