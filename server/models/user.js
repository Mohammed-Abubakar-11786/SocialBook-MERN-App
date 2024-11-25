const { v4: uuidv4 } = require("uuid");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");
const { type } = require("os");
const { DateTime } = require("luxon");

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  image: {
    url: String,
    filename: String,
  },
  latestMsg: {
    type: Date,
  },
  is_online: {
    type: Boolean,
    default: false,
  },
  is_online_in_group: {
    type: Boolean,
    default: false,
  },
  firebaseToken: {
    type: String,
  },
  isPublic: {
    type: Boolean,
    default: true,
  },
  lastSeen: {
    type: Date,
    default: Date.now(),
  },

  sendMsgs: [
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
      createdAt: Date,
    },
  ],

  recMsgs: [
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
      recUser: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      createdAt: Date,
    },
  ],
  sendImgs: [
    {
      _id: {
        type: String,
        default: uuidv4, // Use uuidv4 as the default value for _id
      },
      isDeleted: {
        type: Boolean,
        default: false,
      },
      img: String,
      caption: String,
      sendUser: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      createdAt: Date,
      imageName: String,
    },
  ],
  recImgs: [
    {
      _id: {
        type: String,
        default: uuidv4, // Use uuidv4 as the default value for _id
      },
      isDeleted: {
        type: Boolean,
        default: false,
      },
      img: String,
      caption: String,
      recUser: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      createdAt: Date,
      imageName: String,
    },
  ],
});

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", userSchema);
