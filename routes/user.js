const express = require("express");
const router = express.Router();
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });
const passport = require("passport");

const userController = require("../controller/user.js");

router.route("/signup").get(userController.renderSignupPage).post(
  /* isLoggedIn, */
  /* upload.single("userImage"), */
  /* validateListing, */
  userController.signup
);

router.route("/login").post(
  /* saveRedirectUrl, */
  passport.authenticate("local", {
    failureRedirect: "/",
    failureFlash: true,
  }),
  userController.loginUser
);

//to logout
router.get("/logout", userController.logoutUser);

router.get("/forgetPass", userController.renderForgetPassForm);
router.post("/forgetPass", userController.renderForgetPassForm);

router.post(
  "/forgetPass/checkOTP/:sendOTP",
  userController.renderForgetPassForm
);

router.get(
  "/enterNewPassForm/:username/:email",
  userController.renderNewPassForm
);

router.post("/updatePassWord", userController.updatePassWord);

module.exports = router;
