const express = require("express");
const router = express.Router();
const multer = require("multer");
const { storage, cloudinary } = require("../cloudConfig.js");
const upload = multer({ storage });

const { isLoggedIn, isSame, isEmptyMsg } = require("../middleware.js");

const msgController = require("../controller/message.js");

router.route("/chatWindow/:chatId").get(msgController.renderChatWindow);
router.route("/chatWindow").get(isLoggedIn, msgController.renderChatWindow);
router
  .route("/saveMsg/:chatId")
  .post(isLoggedIn, isEmptyMsg, msgController.saveMsg);
router
  .route("/saveImg/:chatId")
  .post(isLoggedIn, /* upload.single("chatImg"), */ msgController.saveImg);

router
  .route(
    "/deleteMsg/:currUser_id/:chatUser_id/:msgType/:msgId/:delType/:is_img/:img_Name"
  )
  .get(msgController.delMsgs);

router
  .route("/deleteAllMsgs/:currUserId/:chatUserId")
  .get(msgController.delAllMsgs);

router
  .route("/getConversation/:currUserID/:chatUserID")
  .get(msgController.getConversation);

router
  .route("/updateUserLastseen/:userID")
  .get(msgController.updateUserLastseen);

router.route("/sendMsg/:currUserID/:chatUserID").post(msgController.sendMsg);
module.exports = router;
