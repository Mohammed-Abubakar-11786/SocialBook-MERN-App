const Message = require("../models/message");
const user = require("../models/user.js");
const User = require("../models/user.js");
const luxon = require("luxon");

module.exports.renderChatWindow = async (req, res) => {
  let { chatId } = req.params;
  let chatUser = await User.findById(chatId);
  /*   let allMsgs = await Message.find(); */
  const allUsers = await User.find({});
  /*   let sendMsgs = await Message.find({ sender: req.user._id, receiver: chatId });
  let recMsgs = await Message.find({ receiver: req.user._id, sender: chatId }); */
  let sendMsgs = [];
  let recMsgs = [];
  let currUser = req.user;

  if (chatUser && currUser && currUser.sendMsgs.length > 0) {
    for (msg of currUser.sendMsgs) {
      if (msg.sendUser.toString() === chatId.toString()) {
        sendMsgs.push(msg);
      }
    }
  }

  if (currUser && chatUser && chatUser.sendMsgs.length > 0) {
    for (msg of chatUser.sendMsgs) {
      if (msg.sendUser.toString() === currUser._id.toString()) {
        recMsgs.push(msg);
      }
    }
  }

  for (usr of allUsers) {
    let allMsgs = [];
    if (usr.sendMsgs.length > 0 && currUser) {
      for (msg of usr.sendMsgs) {
        if (msg.sendUser.toString() === currUser._id.toString()) {
          allMsgs.push(msg);
        }
      }
    }

    if (usr.recMsgs.length > 0 && currUser) {
      for (msg of usr.recMsgs) {
        if (msg.recUser.toString() === currUser._id.toString()) {
          allMsgs.push(msg);
        }
      }
    }

    if (allMsgs.length > 0) {
      const latestMsg = allMsgs.reduce((prevMsg, currentMsg) =>
        new Date(currentMsg.createdAt) > new Date(prevMsg.createdAt)
          ? currentMsg
          : prevMsg
      );
      usr.latestMsg = latestMsg.createdAt;
      await usr.save();
    } else {
      // No messages for this user, remove latestMsg value
      usr.latestMsg = undefined;
      await usr.save();
    }
  }

  allUsers.sort((a, b) => {
    // If either user has no latestMsg, move the one with latestMsg to the front
    if (!a.latestMsg) return 1;
    if (!b.latestMsg) return -1;

    // Sort by the latestMsg, more recent messages first
    return new Date(b.latestMsg) - new Date(a.latestMsg);
  });

  if (currUser) {
    // Find the index of the user with currUser._id
    const currUserIndex = allUsers.findIndex(
      (user) => user._id.toString() === currUser._id.toString()
    );

    // If currUser is found, move it to the first index
    if (currUserIndex !== -1) {
      const [removed] = allUsers.splice(currUserIndex, 1);
      allUsers.unshift(removed);
    }
  }

  /*   for (user of allUsers) {
    if (currUser && currUser._id === user._id) {
      const userMsgs = allMsgs.filter(
        (msg) =>
          msg.sender === user._id.toString() &&
          msg.receiver.toString() === user._id.toString() &&
          msg.sender.toString() === currUser._id.toString() &&
          msg.receiver.toString() === currUser._id.toString()
      );

      if (userMsgs.length > 0) {
        latestMsg = userMsgs.reduce((prevMsg, currentMsg) =>
          new Date(currentMsg.createdAt) > new Date(prevMsg.createdAt)
            ? currentMsg
            : prevMsg
        );

        let saveInDB = async () => {
          user.latestMsg = latestMsg.createdAt;
          await user.save();
        };
        saveInDB();
      }
    } else if (currUser) {
      const userMsgs = allMsgs.filter(
        (msg) =>
          (msg.sender.toString() === user._id.toString() ||
            msg.receiver.toString() === user._id.toString()) &&
          (msg.sender.toString() === currUser._id.toString() ||
            msg.receiver.toString() === currUser._id.toString())
      );
      if (userMsgs.length > 0) {
        latestMsg = userMsgs.reduce((prevMsg, currentMsg) =>
          new Date(currentMsg.createdAt) > new Date(prevMsg.createdAt)
            ? currentMsg
            : prevMsg
        );
        let saveInDB = async () => {
          user.latestMsg = latestMsg.createdAt;
          await user.save();
        };
        saveInDB();
      }
    }
  }
  allUsers.sort((a, b) => {
    const dateA = a.latestMsg ? new Date(a.latestMsg) : new Date(0);
    const dateB = b.latestMsg ? new Date(b.latestMsg) : new Date(0);
    return dateB - dateA;
  });

  // Sort allUsers array to place currUser at the top
  allUsers.sort((a, b) => {
    if (a._id.toString() === currUserId) return -1;
    if (b._id.toString() === currUserId) return 1;
    return 0;
  }); */

  async function removeLatestMsgField() {
    try {
      // Use updateMany to unset the latestMsg field in all documents
      const result = await User.updateMany({}, { $unset: { latestMsg: "" } });

      console.log(`${result.nModified} documents updated.`);
    } catch (error) {
      console.error("Error:", error);
    }
  }
  // Call the function
  /* removeLatestMsgField(); */
  if (chatId) {
    res.render("messages/chatWindow2.ejs", {
      allUsers,
      chatUser,
      currUser,
      sendMsgs,
      recMsgs,
      luxon,
    });
  } else {
    res.render("messages/chatWindow.ejs", {
      allUsers,
      chatUser,
      currUser,
      sendMsgs,
      recMsgs,
      luxon,
    });
  }
};

module.exports.saveMsg = async (req, res) => {
  let { chatId } = req.params;
  let { msg } = req.body;

  // Find user with chatID
  const chatUser = await User.findById(chatId).exec();

  // Find user with currUser._id
  const currentUser = await User.findById(req.user._id).exec();

  /* let message = new Message();
  message.msg = msg;

  message.sender = req.user._id;
  message.receiver = chatId;
  message.createdAt = Date.now(); */

  let obj1 = {
    msg: msg,
    sendUser: chatUser._id,
    createdAt: Date.now(),
  };
  currentUser.sendMsgs.push(obj1);
  await currentUser.save();

  let obj2 = {
    msg: msg,
    recUser: currentUser._id,
    createdAt: Date.now(),
  };
  chatUser.recMsgs.push(obj2);
  await chatUser.save();

  res.redirect(`/chatWindow/${chatId}`);
};
