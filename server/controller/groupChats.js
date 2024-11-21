const { v4: uuidv4 } = require("uuid");
const luxon = require("luxon");
const User = require("../models/user");
const GroupChats = require("../models/groupChat");
const { cloudinary } = require("../cloudConfig");
const Message = require("../models/message");

module.exports.saveNewGroupUsers = async (req, res) => {
  try {
    let { selectedUsers } = req.body;
    let { currUserID } = req.params;

    let newGroup = new GroupChats();
    selectedUsers = selectedUsers.filter((user) => user != currUserID);
    newGroup.grpUsers = selectedUsers;
    newGroup.grpUsers.push(currUserID);
    newGroup.grpAdmins.push(currUserID);
    newGroup.grpCreationPending = true;
    await newGroup.save();

    let NewGrp = await newGroup.populate("messages grpUsers");

    // let grp = await newGroup.populate("grpUsers");
    return res.status(200).send({
      success: true,
      NewGrp,
    });
  } catch (error) {
    return res.status(200).send({
      error: true,
      msg: error.message,
    });
  }
};

module.exports.saveNewGroupDetails = async (req, res) => {
  try {
    const uploadOptions = { folder: "SocialBook/GroupImages" };

    let file = req.files?.groupImg;
    let url = "";
    if (file) {
      cloudinary.uploader.upload(
        file.tempFilePath,
        uploadOptions,
        async (err, result) => {
          if (err) {
            return res.status(200).send({
              success: false,
              msg: err.message,
            });
          }

          url = result.url;
          let grp = await GroupChats.findById(grpId);
          grp.image.url = url;
          let filename = result.original_filename;
          grp.image.filename = filename;
          await grp.save();
        }
      );
    }

    let { selectedUsers, groupDescription, groupName, grpId } = req.body;
    const selectedUsersId = [];
    JSON.parse(selectedUsers).forEach((usr) => {
      selectedUsersId.push(usr._id);
    });

    let grp = await GroupChats.findById(grpId);
    grp.grpName = groupName;
    grp.grpDescription = groupDescription;
    grp.grpUsers = selectedUsersId;
    grp.grpCreationPending = false;

    await grp.save();
    grp = await grp.populate("grpUsers");

    res.status(200).send({
      success: true,
      grp: grp,
    });
  } catch (error) {
    return res.status(200).send({
      error: true,
      msg: error.message,
    });
  }
};

module.exports.deleteGroup = async (req, res) => {
  try {
    let { grpId } = req.params;

    let grp = await GroupChats.findByIdAndDelete(grpId);

    if (!grp) {
      res
        .status(200)
        .send({ success: false, error: true, msg: "Group does not exist" });
    }

    if (grp.image.filename)
      await cloudinary.uploader.destroy(grp.image.filename);

    res.status(200).send({
      success: true,
    });
  } catch (error) {
    return res.status(200).send({
      error: true,
      msg: error.message,
    });
  }
};

module.exports.getGroupContent = async (req, res) => {
  try {
    let { grpId } = req.params;

    let grp = await GroupChats.findById(grpId)
      .populate("grpUsers")
      .populate({
        path: "messages", // Populate the messages array
        populate: {
          path: "sentByUserId", // Populate sentByUserId in each message
        },
      });

    if (!grp) {
      res
        .status(200)
        .send({ success: false, error: true, msg: "Group does not exist" });
    }
    // console.log(grp);

    res.status(200).send({
      success: true,
      chatContent: grp,
    });
  } catch (error) {
    return res.status(200).send({
      error: true,
      msg: error.message,
    });
  }
};

module.exports.saveGrpMsg = async (req, res) => {
  try {
    let { currUserID, grpId } = req.params;
    // console.log("currUserId =" + currUserID);
    // console.log("grpID =" + grpId);

    // console.log("req.body =" + req.body.newMsg);

    let grp = await GroupChats.findById(grpId);

    let msg = new Message();
    msg.msg = req.body.newMsg;
    msg.sentByUserId = currUserID;
    msg.sentByUserName = req.body.userName;

    await msg.save();

    grp.messages.push(msg._id);

    await grp.save();

    msg = await msg.populate("sentByUserId");

    res.status(200).send({
      success: true,
      msg,
    });
  } catch (error) {
    return res.status(200).send({
      error: true,
      msg: error.message,
    });
  }
};
