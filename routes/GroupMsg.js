const express = require("express");
const router = express.Router();
const { isLoggedIn, isSame, isEmptyMsg } = require("../middleware.js");

const grpMsgController = require("../controller/GroupMsg.js");

router
  .route("/groupChat")
  .get(isLoggedIn, grpMsgController.renderGroupChatWindow);
router.route("/saveGrpMsg/:sendUser").post(grpMsgController.saveSentMsg);

router.route("/delGrpMsg/:msg_id").get(grpMsgController.delGrpMsgs);

module.exports = router;
