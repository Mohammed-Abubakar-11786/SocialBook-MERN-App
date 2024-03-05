const User = require("../models/user");
const Post = require("../models/post");
const luxon = require("luxon");
const { v4: uuidv4 } = require("uuid");
const { storage, cloudinary } = require("../cloudConfig.js");

module.exports.renderNewPostForm = (req, res) => {
  let { description } = req.body;
  res.render("posts/newPostForm.ejs", { description });
};

module.exports.sendPost = async (req, res) => {
  let { post_ID } = req.params;
  let sh = "shared_users-" + post_ID;

  let post = await Post.findById(post_ID);

  if (!post.isVedio) {
    let postImg = post.image.url;
    let post_description = post.description;
    let postImg_name = post.image.filename;
    let currUser = req.user;

    let createdAt = Date.now();
    const _id = uuidv4();
    let toSend = Array.isArray(req.body[sh]) ? req.body[sh] : [req.body[sh]];

    for (let usr of toSend) {
      let recuser = await User.findById(usr);

      post.shares.push({ userId: recuser._id });

      await post.save();

      let obj1 = {
        _id: _id,
        img: postImg,
        caption: post_description,
        sendUser: recuser._id,
        createdAt: createdAt,
        imageName: postImg_name,
      };

      currUser.sendImgs.push(obj1);

      let obj2 = {
        _id: _id,
        img: postImg,
        caption: post_description,
        recUser: currUser._id,
        createdAt: createdAt,
        imageName: postImg_name,
      };
      recuser.recImgs.push(obj2);

      await recuser.save();
      await currUser.save();
    }
    res.status(200).send({
      success: true,
      isVideo: false,
      sendUser: currUser._id,
      recUser: req.body[sh],
      img: postImg,
      createdAt: createdAt,
      msg_id: _id,
      shareCount: post.shares.length,
    });
  } else {
    res.status(200).send({
      success: true,
      isVideo: true,
    });
  }
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
      color: "blue",
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
      color: "black",
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
