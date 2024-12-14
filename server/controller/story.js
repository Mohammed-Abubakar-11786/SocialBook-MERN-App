const Story = require("../models/story");
const { storage, cloudinary } = require("../cloudConfig.js");
const { log } = require("console");

module.exports.renderStoryForm = (req, res) => {
  res.render("stories/newStoryForm.ejs");
};

module.exports.saveStory = async (req, res) => {
  try {
    const uploadOptions = { folder: "SocialBook/stories" };
    const file = req.files.storyVideo;
    let { title } = req.body;
    cloudinary.uploader.upload(
      file.tempFilePath,
      { resource_type: "video", ...uploadOptions },
      async (err, result) => {
        if (err) {
          return res.status(200).send({
            error: true,
            msg: err.message,
          });
        }
        let story = new Story();
        story.owner = req.user._id;
        let owner = req.user;
        let vid_url = result.url;
        let vidURLarray = vid_url.split("/");
        let vidURLName = vidURLarray[vidURLarray.length - 1].split(".");

        let vid_fileName =
          vidURLarray[vidURLarray.length - 3] +
          "/" +
          vidURLarray[vidURLarray.length - 2] +
          "/" +
          vidURLName[0];
        story.video = {
          url: vid_url,
          filename: vid_fileName,
          fileType: file.mimetype,
        };
        story.title = title;
        await story.save();
        res.status(200).send({
          success: true,
          data: {
            video: {
              url: vid_url,
              filename: vid_fileName,
            },
            owner,
          },
        });
      }
    );
  } catch (error) {
    res.status(200).send({
      error: true,
      msg: error.message,
    });
  }
};

module.exports.updateLike = async (req, res) => {
  try {
    let { userID, storyID, like } = req.body;

    // console.log(userID + " = " + storyID + " = " + like);
    let story = await Story.findById(storyID);
    // console.log(story);

    if (like === "disLike") {
      if (story.likes.some((s) => s == userID))
        story.likes = story.likes.filter((s) => s != userID);

      if (!story.disLikes.some((s) => s == userID)) story.disLikes.push(userID);
      else story.disLikes = story.disLikes.filter((s) => s != userID);

      await story.save();

      res.status(200).send({
        success: true,
      });
    } else if (like === "true") {
      if (story.disLikes.some((s) => s == userID))
        story.disLikes = story.disLikes.filter((s) => s != userID);

      story.likes.push(userID);
      await story.save();
      res.status(200).send({
        success: true,
      });
    } else {
      if (story.likes.some((s) => s == userID)) {
        story.likes = story.likes.filter((s) => s != userID);

        await story.save();
      }

      res.status(200).send({
        success: true,
      });
    }
  } catch (error) {
    console.log(error.message);
    res.status(200).send({
      error: true,
      msg: error.message,
    });
  }
};
