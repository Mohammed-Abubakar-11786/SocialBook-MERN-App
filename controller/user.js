const User = require("../models/user");

module.exports.renderSignupPage = (req, res) => {
  res.render("users/login.ejs");
};
