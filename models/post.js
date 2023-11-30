const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const postSchema = new Schema({
  description: String,
  image: {
    url: String,
    filename: String,
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
});

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
