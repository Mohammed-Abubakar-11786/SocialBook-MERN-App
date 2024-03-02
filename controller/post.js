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

  const image_file = req.files.post_image;
  const vedio_file = req.files.post_vedio;
  if (image_file) {
    cloudinary.uploader.upload(
      image_file.tempFilePath,
      uploadOptions,
      async (err, result) => {
        let img_url = result.url;
        let img_fileName = result.original_filename;
        let post = new Post();
        post.description = post_description;
        post.owner = req.user._id;
        post.image = {
          url: img_url,
          filename: img_fileName,
        };

        // Set the 'createdAt' property to the current time
        post.createdAt = luxon.DateTime.now();

        await post.save();
        req.flash("success", "New Post Created");
        res.redirect("/");
      }
    );
  } else {
    console.log("in vedio", vedio_file);
    cloudinary.uploader.upload(
      vedio_file.tempFilePath,
      {
        resource_type: "video",
      },

      async (err, result) => {
        let vedio_url = result.url;
        let vedio_fileName = result.original_filename;
        let post = new Post();
        post.description = post_description;
        post.owner = req.user._id;
        post.vedio = {
          url: vedio_url,
          filename: vedio_fileName,
          fileType: vedio_file.mimetype,
        };
        post.isVedio = true;
        // Set the 'createdAt' property to the current time
        post.createdAt = luxon.DateTime.now();

        await post.save();
        req.flash("success", "New Post Created");
        res.redirect("/");
      }
    );
  }
};

module.exports.incrementLike = async (req, res) => {
  let { id, currUser } = req.params;
  let post = await Post.findById(id);
  let alreadyLiked = false;
  for (let user of post.likedUsers) {
    if (user.toString() === currUser.toString()) {
      alreadyLiked = true;
    }
  }

  if (!alreadyLiked) {
    let count = post.like;
    count++;
    post.like = count;
    post.likedUsers.push(currUser);
    await post.save();
    res.status(200).send({
      success: true,
      liked: true,
      count,
    });
  } else {
    let count = post.like;
    count--;
    post.like = count;
    post.likedUsers = post.likedUsers.filter(
      (usr) => usr.toString() !== currUser.toString()
    );
    await post.save();
    res.status(200).send({
      success: true,
      liked: false,
      count,
    });
  }
};

module.exports.saveCmt = async (req, res) => {
  let { post_id } = req.params;
  let { cmt } = req.body;

  let CurrUser = req.user;
  let post = await Post.findById(post_id);
  let obj = {
    userId: CurrUser._id,
    username: CurrUser.username,
    userImg: CurrUser.image.url,
    comment: cmt,
  };
  post.comments.push(obj);
  await post.save();
  let count = post.comments.length;
  res.status(200).send({ success: true, obj, count });
};
