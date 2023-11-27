const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const storySchema = new Schema({
  image: {
    url: String,
    filename: String,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

const Story = mongoose.model("Story", storySchema);

module.exports = Story;
