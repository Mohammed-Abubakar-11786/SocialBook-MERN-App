const express = require("express");
const router = express.Router();
const { isLoggedIn, isSame, isEmptyMsg } = require("../middleware.js");

const grpMsgController = require("../controller/GroupMsg.js");

router.route("/getGroupChats").get(isLoggedIn, grpMsgController.getGroupChats);
router.route("/saveGrpMsg/:sendUser").post(grpMsgController.saveSentMsg);

router.route("/delGrpMsg/:msg_id").get(grpMsgController.delGrpMsgs);

router.route("/delAllGrpMsg").get(grpMsgController.delAllMsgs);

module.exports = router;
