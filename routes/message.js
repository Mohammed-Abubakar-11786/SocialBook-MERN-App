const express = require("express");
const router = express.Router();
const { isLoggedIn, isSame, isEmptyMsg } = require("../middleware.js");

const msgController = require("../controller/message.js");

router.route("/chatWindow/:chatId").get(msgController.renderChatWindow);
router.route("/chatWindow").get(msgController.renderChatWindow);
router
  .route("/saveMsg/:chatId")
  .post(isLoggedIn, isEmptyMsg, msgController.saveMsg);
module.exports = router;
