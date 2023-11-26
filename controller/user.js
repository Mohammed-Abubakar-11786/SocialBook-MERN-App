const User = require("../models/user");

module.exports.renderSignupPage = (req, res) => {
  res.render("users/signup.ejs");
};

module.exports.signup = async (req, res) => {
  let url = req.file.path;
  let filename = req.file.filename;
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
      console.log(req.user.username);
      res.redirect("/");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
};

module.exports.loginUser = async (req, res) => {
  req.flash("success", `Welcome 🫡 ${req.user.username} You Are Logged In 😀`);
  /* let redirectUrl = res.locals.redirectUrl || "/listings"; */
  res.redirect("/");
};
