const express = require("express");
const router = express.Router();
const multer = require("multer");

const adminController = require("../controller/admin.js");

router.route("/delUser/:userID").get(adminController.delUser);
router.route("/delPost/:postID").get(adminController.delPost);
router.route("/delStory/:storyID").get(adminController.delStory);

module.exports = router;
