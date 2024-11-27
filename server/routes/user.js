const express = require("express");
const router = express.Router();
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });
const passport = require("passport");

const userController = require("../controller/user.js");
const { isLoggedIn } = require("../middleware.js");

router.route("/addUser").post(
  /* isLoggedIn, */
  /* upload.single("userImage"), */
  /* validateListing, */
  userController.signup
);

router.route("/toggleAccType/:userID").get(userController.toggleAccType);

router.get("/currUser", isLoggedIn, userController.getCurrUser);

router.post("/login", userController.handleLogin);

//to logout
router.get("/logout", userController.logoutUser);

router.get(
  "/getSortedUsers/:currUserID",
  isLoggedIn,
  userController.getSortedUsers
);

//all below routes are yet to be build
router.get("/forgetPass", userController.renderForgetPassForm);
router.post("/forgetPass", userController.renderForgetPassForm);

router.post(
  "/forgetPass/checkOTP/:sendOTP",
  userController.renderForgetPassForm
);

router.get("/genrateOtp/:username/:email", userController.genrateOtp);

router.post("/verifyOtp", userController.verifyOtp);

router.post("/updatePassWord", userController.updatePassWord);

router.post("/updateFirebaseToken", userController.updateFirebaseToken);

router
  .route("/giveLatestTokens")
  .post(isLoggedIn, userController.giveLatestTokens);

module.exports = router;
