const { cloudinary } = require("../cloudConfig");
const GroupMsgs = require("../models/GroupMsg");
const Post = require("../models/post");
const Story = require("../models/story");
const User = require("../models/user");

module.exports.delUser = async (req, res) => {
  try {
    let { userID } = req.params;

    let posts = await Post.find({ owner: userID });
    let stories = await Story.find({ owner: userID });
    let grpMsgs = await GroupMsgs.find({ sendUser: { _id: userID } });

    for (let post of posts) {
      if (post.isVedio) {
        if (post.vedio && post.vedio.filename) {
          // let otherImgs = await Post.find({
          //   image: { filename: post.image.filename },
          // });
          await cloudinary.uploader.destroy(post.vedio.filename, {
            resource_type: "video",
          });
        }
      } else {
        if (post.image && post.image.filename) {
          // let otherImgs = await Post.find({
          //   image: { filename: post.image.filename },
          // });
          await cloudinary.uploader.destroy(post.image.filename);
        }
      }
    }

    for (let story of stories) {
      if (story.video && story.video.filename) {
        // let otherImgs = await Story.find({
        //   image: { filename: story.image.filename },
        // });
        await cloudinary.uploader.destroy(story.video.filename);
        // console.log("Stories =>" + otherImgs, otherImgs.length);
      }
    }

    for (let grpMsg of grpMsgs) {
      if (grpMsg.image && grpMsg.image.filename) {
        // let otherImgs = await Story.find({
        //   image: { filename: story.image.filename },
        // });
        await cloudinary.uploader.destroy(grpMsg.image.filename);
        // console.log("Stories =>" + otherImgs, otherImgs.length);
      }
    }

    // imgName can be accessd by each Post (find owner : by userID) > image > filename
    //similarly for stories also each Story (find by owner : userID) > image > filename
    // cloudinary.uploader.destroy(imgName, (err, res) => {
    //   console.log(err, " ", res);
    // });

    let postdelCount = await Post.deleteMany({ owner: userID });
    let storyDelCount = await Story.deleteMany({ owner: userID });
    await GroupMsgs.deleteMany({ sendUser: { _id: userID } });
    await User.findByIdAndDelete(userID);

    res.status(200).send({
      success: true,
      postdelCount,
      storyDelCount,
    });
  } catch (e) {
    res.status(200).send({
      error: true,
      msg: e.message,
    });
  }
};

module.exports.delPost = async (req, res) => {
  try {
    let { postID } = req.params;

    let post = await Post.findById(postID);
    if (post.isVedio) {
      let filename = post.vedio.filename;
      await cloudinary.uploader.destroy(filename, { resource_type: "video" });
    } else {
      let filename = post.image.filename;
      await cloudinary.uploader.destroy(filename);
    }

    await Post.findByIdAndDelete(postID);

    res.status(200).send({
      success: true,
    });
  } catch (error) {
    res.status(200).send({
      error: true,
      msg: error.message || "Internal Server Error",
    });
  }
};

module.exports.delStory = async (req, res) => {
  try {
    let { storyID } = req.params;

    let story = await Story.findById(storyID);

    let filename = story.video.filename;
    await cloudinary.uploader.destroy(filename, { resource_type: "video" });

    await Story.findByIdAndDelete(storyID);
    res.status(200).send({
      success: true,
    });
  } catch (error) {
    res.status(200).send({
      error: true,
      msg: error.message || "Internal Server Error",
    });
  }
};
