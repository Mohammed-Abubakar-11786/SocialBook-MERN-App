const { v4: uuidv4 } = require("uuid");
const luxon = require("luxon");
const GroupMsgs = require("../models/GroupMsg.js");
const User = require("../models/user");

module.exports.renderGroupChatWindow = async (req, res) => {
  let currUser = req.user;
  const allUsers = await User.find({});

  let GroupMsg = await GroupMsgs.findById("65d6361ce55a2dd32dd719cc");
  res.render("messages/groupChatWindow.ejs", { currUser, allUsers, GroupMsg });
};

module.exports.saveSentMsg = async (req, res) => {
  let { sendUser } = req.params;
  let { msg } = req.body;
  let senduserDetails = await User.findById(sendUser);
  let time = Date.now();
  time = luxon.DateTime.fromJSDate(new Date(time), {
    zone: "Asia/Kolkata",
  }).toLocaleString({
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
  let obj = {
    _id: uuidv4(),
    msg: msg,
    sendUser: sendUser,
    createdAt: time,
    sendUserName: senduserDetails.username,
    sendUserImg: senduserDetails.image.url,
  };
  let GroupMsg = await GroupMsgs.findById("65d6361ce55a2dd32dd719cc");
  GroupMsg.Messages.push(obj);
  await GroupMsg.save();
  res.status(200).send({ success: true, obj });
};

module.exports.delGrpMsgs = async (req, res) => {
  let { msg_id } = req.params;
  let GroupMsg = await GroupMsgs.findById("65d6361ce55a2dd32dd719cc");
  const indexToDel = GroupMsg.Messages.findIndex(
    (msg) => msg._id.toString() === msg_id.toString()
  );
  GroupMsg.Messages.splice(indexToDel, 1);
  await GroupMsg.save();

  return res.status(200).send({ success: true });
};
