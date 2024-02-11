const User = require("../models/user");
const Post = require("../models/post");
const luxon = require("luxon");
const { storage, cloudinary } = require("../cloudConfig.js");

module.exports.renderNewPostForm = (req, res) => {
  let { description } = req.body;
  res.render("posts/newPostForm.ejs", { description });
};

module.exports.saveNewPost = async (req, res) => {
  const uploadOptions = { folder: "SocialBook/Posts" };
  let { post_description } = req.body;

  const file = req.files.post_image;
  cloudinary.uploader.upload(
    file.tempFilePath,
    uploadOptions,
    async (err, result) => {
      let url = result.url;
      let filename = result.original_filename;

      let post = new Post();
      post.description = post_description;
      post.owner = req.user._id;
      post.image = {
        url: url,
        filename: filename,
      };

      // Set the 'createdAt' property to the current time
      post.createdAt = luxon.DateTime.now();

      await post.save();
      req.flash("success", "New Post Created");
      res.redirect("/");
    }
  );
};

module.exports.incrementLike = async (req, res) => {
  let { id } = req.params;
  let post = await Post.findById(id);
  let count = post.like;
  count = count + 1;
  await Post.findByIdAndUpdate(id, { like: count });
  res.redirect("/");
};
