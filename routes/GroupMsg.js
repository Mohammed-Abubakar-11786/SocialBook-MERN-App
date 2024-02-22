const express = require("express");
const router = express.Router();

const grpMsgController = require("../controller/GroupMsg.js");

router.route("/saveGrpMsg/:sendUser").post(grpMsgController.saveSentMsg);

module.exports = router;
