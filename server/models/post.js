const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const postSchema = new Schema({
  description: String,
  image: {
    url: String,
    filename: String,
  },
  isVedio: {
    type: Boolean,
    default: false,
  },
  vedio: {
    url: String,
    filename: String,
    fileType: String,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  like: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  likedUsers: [{ type: Schema.Types.ObjectId, ref: "User" }],

  comments: [
    {
      userId: { type: Schema.Types.ObjectId, ref: "User" },
      username: String,
      userImg: String,
      comment: String,
    },
  ],

  shares: [
    {
      userId: { type: Schema.Types.ObjectId, ref: "User" },
    },
  ],

  isPrivate: {
    type: Boolean,
    default: false,
  },

  allowedUsers: [{ type: Schema.Types.ObjectId, ref: "User" }],
});

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
