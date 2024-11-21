const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const msgSchema = new Schema(
  {
    msg: {
      type: String,
    },
    imageUrl: {
      url: String,
      filename: String,
    },
    videoUrl: {
      url: String,
      filename: String,
    },
    seen: {
      type: Boolean,
      default: false,
    },
    sentByUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    sentByUserName: {
      type: String,
    },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", msgSchema);

module.exports = Message;
