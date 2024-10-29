const User = require("../models/user");
const nodemailer = require("nodemailer");
const { storage, cloudinary } = require("../cloudConfig.js");
const { render } = require("ejs");
const passport = require("passport");
const Conversation = require("../models/conversation.js");
const jwt = require("jsonwebtoken");
const getUserDetailsFromToken = require("../helper/getUserDetailsFromToken.js");

module.exports.renderSignupPage = (req, res) => {
  res.render("users/signup.ejs");
};

module.exports.getCurrUser = (req, res) => {
  if (req.isAuthenticated()) {
    return res.status(200).json({
      data: req.user,
      success: true,
    });
  } else {
    // return res.status(200).json({
    //   data: "No user Currently",
    //   error: true,
    // });
    try {
      let getDetailsFromToken = async () => {
        const token = req.cookies?.token || "";

        const user = await getUserDetailsFromToken(token); //if no user then in user object logout: true will be stored

        return res.status(200).json({
          message: "user details",
          data: user,
          success: true,
        });
      };

      getDetailsFromToken();
    } catch (error) {
      return res.status(200).json({
        message: error.message || error,
        error: true,
        success: false,
      });
    }
  }
};

module.exports.toggleAccType = async (req, res) => {
  try {
    let { userID } = req.params;

    let usr = await User.findById(userID);

    usr.isPublic = !usr.isPublic;

    usr.save();

    res.status(200).send({
      success: true,
      userID,
    });
  } catch (error) {
    res.status(200).send({
      error: true,
      msg: error.message,
    });
  }
};

module.exports.signup = async (req, res) => {
  const uploadOptions = { folder: "SocialBook" };
  const file = req.files.userImage;

  cloudinary.uploader.upload(
    file.tempFilePath,
    uploadOptions,
    async (err, result) => {
      let url = result.url;
      let filename = result.original_filename;
      try {
        let { username, email, password, isPublic } = req.body;
        let newUser = new User({ email, username });
        newUser.image = {
          url: url,
          filename: filename,
        };
        newUser.isPublic = isPublic;
        let registerdUser = await User.register(newUser, password);
        // req.login(registerdUser, (err) => {
        //   if (err) {
        //     return next(err);
        //   }

        //   /* var sucMsg = document.getElementById("manualflashSuccess");
        //   sucMsg.append(
        //     `Welcome 🫡 ${req.user.username} You Are SignedUp and Logged In 😀`
        //   );
        //   showAndHide(sucMsg); */
        //   req.flash(
        //     "success",
        //     `Welcome 🫡 ${req.user.username} You Are SignedUp and Logged In 😀`
        //   );
        //   res.redirect("/");
        // });

        res.status(200).send({
          success: true,
        });
      } catch (e) {
        res.status(200).send({
          error: true,
          data: e,
        });
      }
    }
  );
};

module.exports.handleLogin = async (req, res, next) => {
  try {
    let { username } = req.body;
    let user = await User.findByUsername(username);

    if (user) {
      passport.authenticate("local", (err, user, info) => {
        if (err) {
          return res.status(200).json({
            message: "LogedIn Faild",
            data: err,
            error: true,
          });
        }

        if (!user) {
          return res.status(200).json({
            message: "LogedIn Faild",
            data: info,
            error: true,
          });
        }

        req.logIn(user, function (err) {
          if (err) {
            return res.status(200).json({
              message: "LogedIn Faild",
              data: err,
              error: true,
            });
          }

          const tokenData = {
            id: req.user._id,
            email: req.user.email,
          };

          let genrateToken = async () => {
            return await jwt.sign(tokenData, process.env.JWT_SECREAT_KEY, {
              expiresIn: "1d",
            });
          };
          const token = genrateToken();

          const cookieOptions = {
            http: true,
            secure: true,
          };

          return res
            .cookie("token", token, cookieOptions)
            .status(200)
            .json({
              message: `Welcome 🫡 ${req.user.username} You Are Logged In 😀`,
              token: token,
              success: true,
              data: req.user,
              error: false,
            });
        });
      })(req, res, next);
    } else {
      return res.status(200).send({
        data: {
          enteredUsername: username,
          message: `Username ${username} does not exist, Signup to Continue with same username`,
        },
        error: true,
        redirectToSignUp: true,
      });
    }
  } catch (error) {
    return res.status(200).json({
      message: "Something Went Wrong. Try Again Later",
      data: error,
      error: true,
    });
  }
};

module.exports.logoutUser = (req, res, next) => {
  req.logOut((err) => {
    if (err) {
      return res.status(200).json({
        data: err,
        error: true,
      });
    }

    req.session.destroy((err) => {
      if (err) {
        return res.status(200).json({
          message: "Session destruction failed",
          error: true,
        });
      }
      // req.flash(
      //   "success",
      //   `You Logged Out!! Bye 👋👋 ${username} 😊 See You Soon`
      // );

      const cookieOptions = {
        http: true,
        secure: true,
      };

      return res.cookie("token", "", cookieOptions).status(200).json({
        message: "session out",
        success: true,
      });
    });
  });
};

module.exports.renderForgetPassForm = async (req, res) => {
  let { checkEmail, checkUsername, EntdOTP, sendOTP } = req.body;
  let targetUser = {};
  let isOTPsent = Boolean;
  isOTPsent = false;
  let matched = false;
  const allUsers = await User.find({});
  for (usr of allUsers) {
    if (usr.username === checkUsername && usr.email === checkEmail) {
      targetUser = usr;
      matched = true;
    }
  }

  if (EntdOTP && sendOTP && EntdOTP === sendOTP) {
    req.flash("success", `OTP Verified successfully`);
    res.redirect(`/enterNewPassForm/${checkUsername}/${checkEmail}`);
  } else if (checkEmail && checkUsername) {
    if (matched) {
      let userEmail = checkEmail;

      let config = {
        service: "gmail",
        auth: {
          user: "mohdabubakar.11786@gmail.com",
          pass: "ojwiwwuvileirkbq",
        },
      };

      const sendOTP = Math.floor(1000 + Math.random() * 9000);
      const transporter = nodemailer.createTransport(config);
      let message = {
        from: "mohdabubakar.11786@gmail.com", // sender address
        to: userEmail, // list of receivers
        subject: "OTP From 🌐SocialBook", // Subject line
        text: `Your OTP(One Time Password) To Reset your 🌐SocialBook Account Password is:${sendOTP}`, // plain text body
        html: `<!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>OTP Confirmation</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }
        
            .container {
              max-width: 600px;
              margin: 20px auto;
              background-color: #ffffff;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
        
            h2 {
              color: #333333;
            }
        
            p {
              color: #555555;
            }
        
            .otp {
              font-size: 24px;
              font-weight: bold;
              color: #007bff;
            }
        
            .footer {
              margin-top: 20px;
              text-align: center;
              color: #777777;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>OTP Confirmation</h2>
            <p>Your One-Time Password (OTP) is:</p>
            <p class="otp">${sendOTP}</p>
            <div class="footer">
              <p>If you didn't request this OTP, please ignore this email.</p>
            </div>
          </div>
        </body>
        </html>
        `, // html body
      };

      try {
        await transporter.sendMail(message);
        isOTPsent = true;
      } catch (error) {
        console.error("Error sending email:", error);
        isOTPsent = false;
      }

      if (isOTPsent) {
        res.render("users/ForgetPassPage.ejs", {
          checkEmail,
          checkUsername,
          targetUser,
          isOTPsent,
          sendOTP,
        });
      }
    } else {
      checkEmail = "";
      checkUsername = "";
      req.flash("error", `Entered Username and Email Doesn't Match`);
      res.redirect("/forgetPass");
    }
  } else {
    checkEmail = "";
    checkUsername = "";
    res.render("users/ForgetPassPage.ejs", {
      checkEmail,
      checkUsername,
      targetUser,
      isOTPsent,
    });
  }
};

module.exports.renderNewPassForm = async (req, res) => {
  let { username, email } = req.params;
  const allUsers = await User.find({});
  for (usr of allUsers) {
    if (usr.username === username && usr.email === email) {
      targetUser = usr;
    }
  }
  res.render("users/enterNEWPassForm.ejs", { username, email, targetUser });
};

module.exports.updatePassWord = async (req, res) => {
  let { username, email, password } = req.body;
  let targetUser = {};
  const allUsers = await User.find({});
  for (usr of allUsers) {
    if (usr.username === username && usr.email === email) {
      targetUser = usr;
    }
  }

  targetUser.setPassword(password, async () => {
    // Save the user with the new password
    await targetUser.save();

    // Redirect or respond as needed
    req.flash(
      "success",
      "Password updated successfully 🎉🎉🎉, Now Login With New Password !!!"
    );
    res.redirect("/"); // Redirect to the desired location
  });
};

function showAndHide(element) {
  element.style.opacity = "1"; // Ensure initial opacity is set
  element.style.display = "block";

  setTimeout(function () {
    element.style.opacity = "0";
    setTimeout(function () {
      element.style.display = "none";
    }, 1000);
  }, 3000);
}

module.exports.getSortedUsers = async (req, res) => {
  try {
    let { currUserID } = req.params;

    let users = await User.find();

    // Fetch all conversations involving the current user
    let conversations = await Conversation.find({
      $or: [{ sendUser: currUserID }, { recUser: currUserID }],
    }).populate("sendUser recUser messages");

    // Map conversations to users
    let userConversations = conversations.reduce((acc, conv) => {
      let otherUser =
        conv.sendUser._id.toString() === currUserID
          ? conv.recUser
          : conv.sendUser;

      acc[otherUser?._id] = {
        user: otherUser,
        conv,
      };
      return acc;
    }, {});

    // Sort users based on the last updated conversation
    let sortedUsers = users.map((user) => {
      let convData = userConversations[user._id];
      return {
        user,
        conv: convData ? convData.conv : null,
      };
    });

    sortedUsers.sort((a, b) => {
      if (!a.conv && !b.conv) return 0;
      if (!a.conv) return 1;
      if (!b.conv) return -1;
      return new Date(b.conv.updatedAt) - new Date(a.conv.updatedAt);
    });

    let cuser = sortedUsers.filter(
      (usr) => usr.user._id.toString() === currUserID
    );
    // console.log("cuser = " + cuser);
    let otherthanCuser = sortedUsers.filter(
      (usr) => usr.user._id.toString() !== currUserID
    );

    sortedUsers = [...cuser, ...otherthanCuser];

    // console.log(sortedUsers);

    res.status(200).send({
      success: true,
      sortedUsers,
    });
  } catch (error) {
    res.status(200).send({
      error: true,
      msg: error.message,
    });
  }
};
