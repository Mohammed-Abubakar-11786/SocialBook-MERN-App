const passport = require("passport");

module.exports.isLoggedIn = async (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err || !user) {
      return res.status(200).send({ success: false, notLogin: true });
    }
    // If authenticated, attach the user to the request object
    req.user = user;
    next(); // Continue to the controllers next
  })(req, res, next);
};

module.exports.isLoggedInForAjax = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "Login First to perform the operation");
    return res.status(200).send({ success: true, redirectTo: "/" }); // Send back JSON response with redirect URL
  }
  next();
};

module.exports.isSame = (req, res, next) => {
  let { chatId } = req.params;
  if (req.user._id == chatId) {
    req.flash("error", "You Cannot chat your Self");
    return res.redirect("/");
  }
  next();
};

module.exports.isEmptyMsg = (req, res, next) => {
  let { chatId } = req.params;
  let { msg } = req.body;
  if (msg === "") {
    return res.redirect("/chatWindow/" + chatId);
  }
  next();
};
