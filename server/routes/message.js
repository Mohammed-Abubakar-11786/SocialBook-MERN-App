const express = require("express");
const router = express.Router();
const multer = require("multer");
const { storage, cloudinary } = require("../cloudConfig.js");
const upload = multer({ storage });

const { isLoggedIn, isSame, isEmptyMsg } = require("../middleware.js");

const msgController = require("../controller/message.js");

router.route("/chatWindow/:chatId").get(msgController.renderChatWindow); // not being used
router.route("/chatWindow").get(isLoggedIn, msgController.renderChatWindow); // not being used
router // not being used
  .route("/saveMsg/:chatId")
  .post(isLoggedIn, isEmptyMsg, msgController.saveMsg);
router // not being used
  .route("/saveImg/:chatId")
  .post(isLoggedIn, /* upload.single("chatImg"), */ msgController.saveImg);

router //yet to implement
  .route(
    "/deleteMsg/:currUser_id/:chatUser_id/:msgType/:msgId/:delType/:is_img/:img_Name"
  )
  .get(isLoggedIn, msgController.delMsgs);

router //yet to implement
  .route("/deleteAllMsgs/:currUserId/:chatUserId")
  .get(isLoggedIn, msgController.delAllMsgs);

router
  .route("/getConversation/:currUserID/:chatUserID")
  .get(isLoggedIn, msgController.getConversation);

router
  .route("/updateUserLastseen/:userID")
  .get(isLoggedIn, msgController.updateUserLastseen);

router
  .route("/sendMsg/:currUserID/:chatUserID")
  .post(isLoggedIn, msgController.sendMsg);

router
  .route("/clearChats/:currUserID/:chatUserID")
  .get(isLoggedIn, msgController.clearChats);
module.exports = router;
