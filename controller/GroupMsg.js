const { v4: uuidv4 } = require("uuid");
const luxon = require("luxon");
const GroupMsgs = require("../models/GroupMsg.js");
const User = require("../models/user");

let GroupMsg = new GroupMsgs();

module.exports.saveSentMsg = async (req, res) => {
  let { sendUser } = req.params;
  let { msg } = req.body;
  let senduserDetails = await User.findById(sendUser);
  let obj = {
    _id: uuidv4(),
    msg: msg,
    sendUser: sendUser,
    createdAt: Date.now(),
    sendUserName: senduserDetails.username,
    sendUserImg: senduserDetails.image.url,
  };
  GroupMsg.Messages.push(obj);
  await GroupMsg.save();
  res.status(200).send({ success: true, obj });
};
