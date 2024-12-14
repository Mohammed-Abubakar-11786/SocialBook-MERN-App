const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const storySchema = new Schema(
  {
    video: {
      url: String,
      filename: String,
      fileType: String,
    },
    title: {
      type: String,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    disLikes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Story = mongoose.model("Story", storySchema);

module.exports = Story;
