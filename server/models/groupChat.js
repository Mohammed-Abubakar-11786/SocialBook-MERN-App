const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const imageSchema = new mongoose.Schema({
  url: {
    type: String,
    default:
      "https://cdn.pixabay.com/photo/2016/11/14/17/39/group-1824145_1280.png", // Default URL
  },
  filename: {
    type: String,
    default: "", // Default filename
  },
});

const grpChats = new Schema(
  {
    isGroup: {
      type: Boolean,
      default: true,
    },
    grpName: {
      type: String,
    },
    grpDescription: {
      type: String,
    },
    image: {
      type: imageSchema, // Embedding the image schema
      default: () => ({}), // Set default to an empty object so defaults within imageSchema apply
    },
    grpAdmins: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    grpUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    messages: [
      {
        type: Schema.Types.ObjectId,
        ref: "Message",
      },
    ],

    grpCreationPending: {
      type: Boolean,
    },
  },
  { timestamps: true }
);

const GroupChats = mongoose.model("GroupChats", grpChats);

module.exports = GroupChats;
