const express = require("express");
const router = express.Router();

const userController = require("../controller/user.js");

router.route("/login").get(userController.renderSignupPage);

module.exports = router;
