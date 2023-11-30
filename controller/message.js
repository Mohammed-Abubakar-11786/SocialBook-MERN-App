const Message = require("../models/message");
const User = require("../models/user.js");
const luxon = require("luxon");

module.exports.renderChatWindow = async (req, res) => {
  let { chatId } = req.params;
  let chatUser = await User.findById(chatId);
  let allMsgs = await Message.find();
  let sendMsgs = await Message.find({ sender: req.user._id, receiver: chatId });
  let recMsgs = await Message.find({ receiver: req.user._id, sender: chatId });
  res.render("messages/chatWindow.ejs", { chatUser, sendMsgs, recMsgs, luxon });
};

module.exports.saveMsg = async (req, res) => {
  let { chatId } = req.params;
  let { msg } = req.body;

  let message = new Message();
  message.msg = msg;

  message.sender = req.user._id;
  message.receiver = chatId;
  message.createdAt = Date.now();

  await message.save();
  res.redirect(`/chatWindow/${chatId}`);
};
