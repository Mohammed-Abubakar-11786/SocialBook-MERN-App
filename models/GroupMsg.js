const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { v4: uuidv4 } = require("uuid");

const grpMsgs = new Schema({
  Messages: [
    {
      _id: {
        type: String,
        default: uuidv4, // Use uuidv4 as the default value for _id
      },
      isDeleted: {
        type: Boolean,
        default: false,
      },
      msg: String,
      sendUser: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      sendUserImg: String,
      sendUserName: String,
      createdAt: String,
      isDelForSelf: {
        type: Boolean,
        default: false,
      },
      isDelForSelfUser: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    },
  ],
});

const GroupMsgs = mongoose.model("GroupMsgs", grpMsgs);

module.exports = GroupMsgs;
