const User = require("../models/user");
const nodemailer = require("nodemailer");
const { storage, cloudinary } = require("../cloudConfig.js");
const { render } = require("ejs");
const passport = require("passport");
const Conversation = require("../models/conversation.js");
const jwt = require("jsonwebtoken");
const getUserDetailsFromToken = require("../helper/getUserDetailsFromToken.js");
const e = require("connect-flash");
const sessionStore = require("connect-mongo"); // or your session store
const GroupChats = require("../models/groupChat.js");
const Message = require("../models/message.js");
const { default: mongoose } = require("mongoose");

module.exports.renderSignupPage = (req, res) => {
  res.render("users/signup.ejs");
};

//* From the below route I was sending a very large response of the req object itself Show in production I was facing an issue of no headers found because there was an internal server error which was getting reflected as no header found under course policy only at production
module.exports.getCurrUser = async (req, res) => {
  //we user passport jwt to check for curr user here after login a token is genrated and sent to frontend where the token is stored in the localstorage and while sending the req to find currUser the token is sent in autherisetion header and the passport middelware validates the token and returns the users data if the token is valid and not expired
  try {
    if (req.user)
      return res.status(200).json({
        data: req.user,
        success: true,
      });
    else
      return res.status(200).json({
        success: false,
      });
  } catch (error) {
    return res.status(200).json({
      message: error.message || error,
      error: true,
      success: false,
    });
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

module.exports.handleLogin = async (req, res) => {
  try {
    let { username } = req.body;
    let user = await User.findByUsername(username);

    if (user) {
      passport.authenticate("local", async (err, user, info) => {
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

        req.logIn(user, async function (err) {
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

          const token = jwt.sign(tokenData, process.env.JWT_SECREAT_KEY, {
            expiresIn: "1h",
          });

          return res.status(200).json({
            message: `Welcome 🫡 ${req.user.username} You Are Logged In 😀`,
            token: "Bearer " + token,
            success: true,
            data: req.user,
            error: false,
          });
        });
      })(req, res);
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

      return res.status(200).json({
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

module.exports.genrateOtp = async (req, res) => {
  try {
    let { username, email } = req.params;
    const usr = await User.findOne({ username: username, email: email });

    if (usr) {
      let userEmail = email;

      let config = {
        service: "gmail",
        auth: {
          user: "mohdabubakar.11786@gmail.com",
          pass: "ojwiwwuvileirkbq",
        },
      };

      let sendOTP = Math.floor(1000 + Math.random() * 9000);
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
        res.status(200).send({
          success: false,
          isOTPsent: false,
          error: true,
        });
      }

      if (isOTPsent) {
        res.status(200).send({
          success: true,
          isOTPsent: true,
          otp: sendOTP,
        });
      }
    } else {
      res.status(200).send({
        success: false,
        isOTPsent: false,
        userNotExist: true,
      });
    }
  } catch (error) {
    res.status(200).send({
      success: false,
      error: true,
    });
  }
};

module.exports.verifyOtp = async (req, res) => {
  try {
    let { otp } = req.body;
    console.log(otp + " " + sendOTP);

    if (otp === sendOTP) {
      res.status(200).send({
        success: true,
        otpMached: true,
      });
    } else {
      res.status(200).send({
        success: true,
        otpMached: false,
      });
    }
  } catch (error) {
    res.status(200).send({
      success: false,
      error: true,
      msg: error.message,
    });
  }
};

module.exports.updatePassWord = async (req, res) => {
  try {
    let { username, email, password } = req.body;
    const usr = await User.findOne({ username, email });
    if (usr) {
      usr.setPassword(password, async () => {
        // Save the user with the new password
        await usr.save();

        res.status(200).send({
          success: true,
        });
      });
    } else {
      res.status(200).send({
        success: false,
        userNotExist: true,
      });
    }
  } catch (error) {
    res.status(200).send({
      success: false,
      error: true,
      msg: error.message,
    });
  }
};

module.exports.updateFirebaseToken = async (req, res) => {
  try {
    let { firebaseToken, currUserID } = req.body;
    const usr = await User.findByIdAndUpdate(currUserID, {
      firebaseToken: firebaseToken,
    });
    res.status(200).send({
      success: true,
    });
  } catch (error) {
    res.status(200).send({
      success: false,
      error: true,
      msg: error.message,
    });
  }
};

module.exports.giveLatestTokens = async (req, res) => {
  try {
    let { userIds } = req.body;

    if (typeof userIds === "string") {
      userIds = userIds.split(",");
    }

    // Find users with IDs in the array
    const users = await User.find({ _id: { $in: userIds } });

    // Extract firebase tokens
    let tokens = [];
    if (users) {
      users.map((usr) => {
        if (usr.firebaseToken) {
          tokens.push(usr.firebaseToken.toString());
        }
      });
    }

    res.status(200).send({
      success: true,
      tokens,
    });
  } catch (error) {
    // console.log("ss_ " + error.message);

    res.status(200).send({
      success: false,
      error: true,
      msg: error.message,
    });
  }
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
  // try {
  let { currUserID } = req.params;

  let users = await User.find();

  // Fetch all conversations involving the current user
  let conversations = await Conversation.find({
    $or: [
      { sendUser: currUserID, forUser: currUserID },
      { recUser: currUserID, forUser: currUserID },
    ],
  }).populate("sendUser recUser messages");

  // Map conversations to users
  let userConversations = conversations.reduce((acc, conv) => {
    let otherUser =
      conv.sendUser?._id.toString() === currUserID
        ? conv.recUser
        : conv.sendUser;

    // console.log("otherUser._id " + otherUser._id);
    // console.log("otherUser.username " + otherUser.username);

    acc[otherUser?._id] = {
      user: otherUser,
      conv,
    };
    return acc;
  }, {});

  // Sort users based on the last updated conversation
  let sortedUsers = users.map((user) => {
    let convData = userConversations[user?._id];

    if (convData && convData.conv.messages.length > 0) {
      return {
        user,
        conv: convData ? convData.conv : null,
      };
    } else {
      return {
        user,
        conv: null,
      };
    }
  });

  let myGroup = await GroupChats.find({
    grpUsers: { $in: [currUserID] },
  }).populate("grpUsers messages"); // Populate grpUsers field
  // .populate({
  //   path: "messages", // Populate the messages array
  //   populate: {
  //     path: "sentByUserId", // Populate sentByUserId in each message
  //   },
  // });

  // console.log(myGroup);

  if (myGroup.length > 0) {
    myGroup = myGroup.reduce((acc, grp) => {
      acc = {
        conv: grp,
      };
      sortedUsers.push(acc);
      return acc;
    }, {});
  }

  sortedUsers.sort((a, b) => {
    if (!a.conv && !b.conv) return 0;
    if (!a.conv) return 1;
    if (!b.conv) return -1;
    return new Date(b.conv.updatedAt) - new Date(a.conv.updatedAt);
  });

  let cuser = sortedUsers.filter((usr) => {
    if (!usr.conv?.isGroup) return usr.user?._id.toString() === currUserID;
  });
  // console.log("cuser = " + cuser);
  let otherthanCuser = sortedUsers.filter((usr) => {
    if (!usr.conv?.isGroup) return usr.user?._id.toString() !== currUserID;
    else return true;
  });

  sortedUsers = [...cuser, ...otherthanCuser];

  res.status(200).send({
    success: true,
    sortedUsers,
  });
  // } catch (error) {
  //   res.status(200).send({
  //     error: true,
  //     msg: error.message,
  //   });
  // }
};
