const User = require("../models/user");
const nodemailer = require("nodemailer");
const { storage, cloudinary } = require("../cloudConfig.js");
const { render } = require("ejs");

module.exports.renderSignupPage = (req, res) => {
  res.render("users/signup.ejs");
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
        let { username, email, password } = req.body;
        let newUser = new User({ email, username });
        newUser.image = {
          url: url,
          filename: filename,
        };
        let registerdUser = await User.register(newUser, password);
        req.login(registerdUser, (err) => {
          if (err) {
            return next(err);
          }
          req.flash(
            "success",
            `Welcome 🫡 ${req.user.username} You Are SignedUp and Logged In 😀`
          );
          res.redirect("/");
        });
      } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
      }
    }
  );
};

module.exports.loginUser = async (req, res) => {
  req.flash("success", `Welcome 🫡 ${req.user.username} You Are Logged In 😀`);
  /* let redirectUrl = res.locals.redirectUrl || "/listings"; */
  res.redirect("/");
};

module.exports.logoutUser = (req, res, next) => {
  let username = req.user.username;
  req.logOut((err) => {
    if (err) {
      return next(err);
    }
    req.flash(
      "success",
      `You Logged Out!! Bye 👋👋 ${username} 😊 See You Soon`
    );
    res.redirect("/");
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
