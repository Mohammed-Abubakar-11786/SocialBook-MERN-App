const mongoose = require("mongoose");
const { schema } = require("./message");
const Schema = mongoose.Schema;

const conversationSchema = new Schema(
  {
    forUser: { type: Schema.Types.ObjectId, ref: "User" },
    sendUser: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    recUser: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    messages: [
      {
        type: Schema.Types.ObjectId,
        ref: "Message",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Conversation = mongoose.model("Conversation", conversationSchema);

module.exports = Conversation;
