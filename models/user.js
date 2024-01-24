const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

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
  sendMsgs: [
    {
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
      msg: String,
      recUser: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      createdAt: Date,
    },
  ],
});

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", userSchema);
