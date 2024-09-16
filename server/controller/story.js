const Story = require("../models/story");
const { storage, cloudinary } = require("../cloudConfig.js");

module.exports.renderStoryForm = (req, res) => {
  res.render("stories/newStoryForm.ejs");
};

module.exports.saveStory = async (req, res) => {
  try {
    const uploadOptions = { folder: "SocialBook/stories" };
    const file = req.files.storyImage;
    cloudinary.uploader.upload(
      file.tempFilePath,
      uploadOptions,
      async (err, result) => {
        let story = new Story();
        story.owner = req.user._id;
        let owner = req.user;
        let img_url = result.url;
        let imgURLarray = img_url.split("/");
        let imgURLName = imgURLarray[imgURLarray.length - 1].split(".");

        let img_fileName =
          imgURLarray[imgURLarray.length - 3] +
          "/" +
          imgURLarray[imgURLarray.length - 2] +
          "/" +
          imgURLName[0];
        story.image = {
          url: img_url,
          filename: img_fileName,
        };
        await story.save();
        res.status(200).send({
          success: true,
          data: {
            image: {
              url: img_url,
              filename: img_fileName,
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
