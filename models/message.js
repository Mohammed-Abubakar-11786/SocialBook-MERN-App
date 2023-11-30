const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const msgSchema = new Schema({
  msg: {
    type: String,
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  receiver: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
  },
});

const Message = mongoose.model("Message", msgSchema);

module.exports = Message;
