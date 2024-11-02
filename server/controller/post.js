const User = require("../models/user");
const Post = require("../models/post");
const luxon = require("luxon");
const { v4: uuidv4 } = require("uuid");
const { storage, cloudinary } = require("../cloudConfig.js");
const { log } = require("console");
const { all } = require("../routes/post.js");

module.exports.renderNewPostForm = (req, res) => {
  let { description } = req.body;
  res.render("posts/newPostForm.ejs", { description });
};

module.exports.sendPost = async (req, res) => {
  try {
    let { post_ID } = req.params;
    let sh = `shared_users-${post_ID}`;
    let post = await Post.findById(post_ID);

    if (!post.isVedio) {
      let postImg = post.image.url;
      let post_description = post.description;
      let postImg_name = post.image.filename;
      let currUser = req.user;

      let createdAt = Date.now();
      const _id = uuidv4();
      let toSend = Array.isArray(req.body[sh]) ? req.body[sh] : [req.body[sh]];

      //check for if no users selected
      if (!req.body[sh]) {
        return res.status(200).send({
          noSendUsers: true,
        });
      }
      for (let usr of toSend) {
        let recuser = await User.findById(usr);

        post.shares.push({ userId: recuser?._id });

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
  } catch (e) {
    res.status(200).send({
      success: false,
      error: true,
    });
  }
};

module.exports.saveNewPost = async (req, res) => {
  try {
    const uploadOptions = { folder: "SocialBook/Posts" };
    let { post_description, allowed_users, NoOfAllowedUsers } = req.body;

    let isPrivate;
    if (NoOfAllowedUsers > 1) isPrivate = true;
    else isPrivate = false;

    // Ensure allowed_users is an array
    if (typeof allowed_users === "string" && isPrivate) {
      allowed_users = allowed_users.split(",");
    }

    const image_file = req.files.post_image;
    const vedio_file = req.files.post_video;

    // console.log("image_file :" + image_file);
    // console.log("vedio_file :" + req.files.post_video);
    if (image_file) {
      cloudinary.uploader.upload(
        image_file.tempFilePath,
        uploadOptions,
        async (err, result) => {
          // let img_fileName = result.original_filename;

          let img_url = result.url;
          let imgURLarray = img_url.split("/");
          let imgURLName = imgURLarray[imgURLarray.length - 1].split(".");

          let img_fileName =
            imgURLarray[imgURLarray.length - 3] +
            "/" +
            imgURLarray[imgURLarray.length - 2] +
            "/" +
            imgURLName[0];
          let post = new Post();
          post.description = post_description;
          post.owner = req.user;
          post.image = {
            url: img_url,
            filename: img_fileName,
          };

          post.isPrivate = isPrivate;

          if (isPrivate) {
            post.allowedUsers = allowed_users;
          }
          // Set the 'createdAt' property to the current time
          post.createdAt = luxon.DateTime.now();

          await post.save();
          res.status(200).send({
            success: true,
            data: post,
          });
        }
      );
    } else {
      cloudinary.uploader.upload(
        vedio_file.tempFilePath,
        { resource_type: "video", ...uploadOptions },
        async (err, result) => {
          if (err) {
            console.error("Error uploading video to Cloudinary:", err);
            return res.status(500).send({
              success: false,
              error: true,
              e: "Error uploading video",
            });
          }
          let vedio_url = result.url;
          // let vedio_fileName = result.original_filename;
          let vedioUrlarray = vedio_url.split("/");
          let vedioUrlName = vedioUrlarray[vedioUrlarray.length - 1].split(".");

          let vedio_fileName =
            vedioUrlarray[vedioUrlarray.length - 3] +
            "/" +
            vedioUrlarray[vedioUrlarray.length - 2] +
            "/" +
            vedioUrlName[0];
          let post = new Post();
          post.description = post_description;
          post.owner = req.user;
          post.vedio = {
            url: vedio_url,
            filename: vedio_fileName,
            fileType: vedio_file.mimetype,
          };
          post.isVedio = true;
          // Set the 'createdAt' property to the current time
          post.createdAt = luxon.DateTime.now();

          post.isPrivate = isPrivate;

          if (isPrivate) post.allowedUsers = allowed_users;

          await post.save();
          res.status(200).send({
            success: true,
            data: post,
          });
        }
      );
    }
  } catch (error) {
    res.status(200).send({
      error: true,
      e: error.message,
    });
  }
};

module.exports.incrementLike = async (req, res) => {
  try {
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
      count++; //to like
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
      count--; //to dislike
      post.like = count;
      post.likedUsers = post.likedUsers.filter(
        (usr) => usr.toString() !== currUser.toString()
      );
      await post.save();
      res.status(200).send({
        success: true,
        liked: false,
        count,
        color: "gray",
      });
    }
  } catch (error) {
    res.status(200).send({
      success: false,
      error: true,
      message: error.message || "Internal server error",
    });
  }
};

module.exports.saveCmt = async (req, res) => {
  try {
    let { post_id } = req.params;
    let { cmt } = req.body;
    let CurrUser = req.user;
    let post = await Post.findById(post_id);
    if (!post) {
      return res
        .status(404)
        .send({ success: false, message: "Post not found" });
    }
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
  } catch (e) {
    return res
      .status(200)
      .send({ error: true, message: "Internel Server Error", error: e });
  }
};
