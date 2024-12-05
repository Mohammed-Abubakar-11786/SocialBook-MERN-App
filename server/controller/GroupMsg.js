const { v4: uuidv4 } = require("uuid");
const luxon = require("luxon");
const GroupMsgs = require("../models/GroupMsg.js");
const User = require("../models/user");
/* const { delAllMsgs } = require("./message.js"); */

module.exports.getGroupChats = async (req, res) => {
  try {
    let currUser = req.user;
    const allUsers = await User.find({});

    let grpMsgs = await GroupMsgs.find().populate("sendUser");
    // console.log(grpMsgs);

    return res.status(200).send({
      success: true,
      data: grpMsgs,
    });
  } catch (error) {
    return res.status(200).send({
      error: true,
      msg: error.message,
    });
  }
};

module.exports.saveSentMsg = async (req, res) => {
  try {
    let { sendUser } = req.params;
    let { msg } = req.body;

    let grpmsg = new GroupMsgs();
    grpmsg.msg = msg;
    grpmsg.sendUser = sendUser;

    await grpmsg.save();

    grpmsg = await GroupMsgs.findById(grpmsg._id).populate("sendUser");
    res.status(200).send({ success: true, grpmsg });
  } catch (error) {
    res.status(200).send({ error: true, msg: error.message });
  }
};

module.exports.delGrpMsgs = async (req, res) => {
  try {
    let { msg_id } = req.params;
    await GroupMsgs.findByIdAndDelete(msg_id);

    return res.status(200).send({ success: true });
  } catch (error) {
    return res.status(200).send({ error: true });
  }
};

module.exports.delAllMsgs = async (req, res) => {
  await GroupMsgs.deleteMany();
  res.status(200).send({ success: true });
};
