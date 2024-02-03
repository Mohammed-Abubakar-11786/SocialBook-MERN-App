const Story = require("../models/story");
const { storage, cloudinary } = require("../cloudConfig.js");

module.exports.renderStoryForm = (req, res) => {
  res.render("stories/newStoryForm.ejs");
};

module.exports.saveStory = async (req, res) => {
  const uploadOptions = { folder: "SocialBook/stories" };
  const file = req.files.storyImage;
  cloudinary.uploader.upload(
    file.tempFilePath,
    uploadOptions,
    async (err, result) => {
      let url = result.url;
      let filename = result.original_filename;
      let story = new Story();
      story.owner = req.user._id;
      story.image = {
        url: url,
        filename: filename,
      };
      await story.save();
      req.flash("success", "New Story Created");
      res.redirect("/");
    }
  );
};
