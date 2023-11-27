const User = require("../models/user");
const Post = require("../models/post");

module.exports.renderNewPostForm = (req, res) => {
  let { description } = req.body;
  res.render("posts/newPostForm.ejs", { description });
};

module.exports.saveNewPost = async (req, res) => {
  let url = req.file.path;
  let filename = req.file.filename;

  let post = new Post(req.body.post);
  post.owner = req.user._id;
  post.image = {
    url: url,
    filename: filename,
  };
  await post.save();
  req.flash("success", "New Post Created");
  res.redirect("/");
};
