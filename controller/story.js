const Story = require("../models/story");

module.exports.renderStoryForm = (req, res) => {
  res.render("stories/newStoryForm.ejs");
};

module.exports.saveStory = async (req, res) => {
  let url = req.file.path;
  let filename = req.file.filename;

  let story = new Story(req.body);
  story.owner = req.user._id;
  story.image = {
    url: url,
    filename: filename,
  };
  await story.save();
  req.flash("success", "New Story Created");
  res.redirect("/");
};
