const { v4: uuidv4 } = require("uuid");
const Message = require("../models/message");
const User = require("../models/user.js");
const luxon = require("luxon");
const multer = require("multer");
const { storage, cloudinary } = require("../cloudConfig.js");
const Conversation = require("../models/conversation.js");
const { log } = require("console");
const upload = multer({ storage });

module.exports.renderChatWindow = async (req, res) => {
  let { chatId } = req.params;
  let chatUser = await User.findById(chatId);

  const allUsers = await User.find({});

  let sendMsgs = [];
  let recMsgs = [];
  let sendImgs = [];
  let recImgs = [];
  let currUser = req.user;

  if (chatUser && currUser && currUser.sendMsgs.length > 0) {
    for (msg of currUser.sendMsgs) {
      if (msg.sendUser.toString() === chatId.toString()) {
        sendMsgs.push(msg);
      }
    }
  }

  if (currUser && chatUser && currUser.recMsgs.length > 0) {
    for (msg of currUser.recMsgs) {
      if (msg.recUser.toString() === chatId.toString()) {
        recMsgs.push(msg);
      }
    }
  }
  //storing all sendImgs
  if (chatUser && currUser && currUser.sendImgs.length > 0) {
    for (img of currUser.sendImgs) {
      if (img.sendUser.toString() === chatId.toString()) {
        sendImgs.push(img);
      }
    }
  }

  //storing all recImgs
  if (currUser && chatUser && currUser.recImgs.length > 0) {
    for (img of currUser.recImgs) {
      if (img.recUser.toString() === chatId.toString()) {
        recImgs.push(img);
      }
    }
  }

  for (usr of allUsers) {
    let allMsgs = [];

    if (currUser && currUser.sendMsgs.length > 0) {
      for (msg of currUser.sendMsgs) {
        if (msg.sendUser.toString() === usr._id.toString()) {
          allMsgs.push(msg);
        }
      }
    }

    if (currUser && currUser.recMsgs.length > 0) {
      for (msg of currUser.recMsgs) {
        if (msg.recUser.toString() === usr._id.toString()) {
          allMsgs.push(msg);
        }
      }
    }
    //storing all sendImgs
    if (currUser && currUser.sendImgs.length > 0) {
      for (img of currUser.sendImgs) {
        if (img.sendUser.toString() === usr._id.toString()) {
          allMsgs.push(img);
        }
      }
    }

    //storing all recImgs
    if (currUser && currUser.recImgs.length > 0) {
      for (img of currUser.recImgs) {
        if (img.recUser.toString() === usr._id.toString()) {
          allMsgs.push(img);
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

  const AllMsgs = [
    ...(recMsgs || []).map((msg) => ({
      type: "recMsg",
      msg: msg.msg,
      id: msg._id,
      isDeleted: msg.isDeleted,
      createdAt: msg.createdAt,
    })),
    ...(sendMsgs || []).map((msg) => ({
      type: "sendMsg",
      msg: msg.msg,
      id: msg._id,
      isDeleted: msg.isDeleted,
      createdAt: msg.createdAt,
    })),
    ...(sendImgs || []).map((msg) => ({
      type: "sendMsg",
      isImage: true,
      caption: msg.caption,
      img: msg.img,
      id: msg._id,
      isDeleted: msg.isDeleted,
      createdAt: msg.createdAt,
    })),
    ...(recImgs || []).map((msg) => ({
      type: "recMsg",
      isImage: true,
      caption: msg.caption,
      img: msg.img,
      id: msg._id,
      isDeleted: msg.isDeleted,
      createdAt: msg.createdAt,
    })),
  ];
  const sortedMsgs = AllMsgs.sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  );

  const AllSelfMsgs = [
    ...(sendMsgs || []).map((msg) => ({
      type: "sendMsg",
      msg: msg.msg,
      id: msg._id,
      isDeleted: msg.isDeleted,
      createdAt: msg.createdAt,
    })),
    ...(sendImgs || []).map((msg) => ({
      type: "sendMsg",
      isImage: true,
      caption: msg.caption,
      img: msg.img,
      id: msg._id,
      isDeleted: msg.isDeleted,
      createdAt: msg.createdAt,
    })),
  ];
  const sortedSelfMsgs = AllSelfMsgs.sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  );

  async function removeLatestMsgField() {
    try {
      // Use updateMany to unset the latestMsg field in all documents
      const result = await User.updateMany({}, { $unset: { latestMsg: "" } });

      console.log(`${result.nModified} documents updated.`);
    } catch (error) {
      console.error("Error:", error);
    }
  }

  if (chatId) {
    res.render("messages/chatWindow2.ejs", {
      allUsers,
      chatUser,
      currUser,
      sortedMsgs,
      sortedSelfMsgs,
      luxon,
    });
  } else {
    res.render("messages/chatWindow.ejs", {
      allUsers,
      chatUser,
      currUser,
      sortedMsgs,
      sortedSelfMsgs,
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
  const _id = uuidv4();

  let msgDate = Date.now();
  let obj1 = {
    _id: _id,
    msg: msg,
    sendUser: chatUser._id,
    createdAt: msgDate,
  };
  currentUser.sendMsgs.push(obj1);
  await currentUser.save();

  let obj2 = {
    _id: _id,
    msg: msg,
    recUser: currentUser._id,
    createdAt: msgDate,
  };
  chatUser.recMsgs.push(obj2);
  await chatUser.save();

  /*   req.flash("success", `Message sent to ${chatUser.username}`); */
  /* res.redirect(`/chatWindow/${chatId}`) */
  res.status(200).send({
    success: true,
    msg: msg,
    createdAt: msgDate,
    _id,
  });
};

module.exports.saveImg = async (req, res) => {
  let { chatId } = req.params;
  let { caption } = req.body;

  /* let url = req.file.path; */
  /*  console.log(req.files.chatImg); the file to upload */
  const uploadOptions = { folder: "SocialBook/Chats" };
  const file = req.files.chatImg;
  cloudinary.uploader.upload(
    file.tempFilePath,
    uploadOptions,
    async (err, result) => {
      let url = result.url;
      let imgURLarray = url.split("/");
      let imgURLName = imgURLarray[imgURLarray.length - 1].split(".");
      let imageName =
        imgURLarray[imgURLarray.length - 3] +
        "/" +
        imgURLarray[imgURLarray.length - 2] +
        "/" +
        imgURLName[0];
      // Find user with chatID
      const chatUser = await User.findById(chatId).exec();

      // Find user with currUser._id
      const currentUser = await User.findById(req.user._id).exec();

      const _id = uuidv4();

      let ImgDate = Date.now();

      let obj1 = {
        _id: _id,
        img: url,
        caption: caption,
        sendUser: chatUser._id,
        createdAt: Date.now(),
        imageName: imageName,
      };

      currentUser.sendImgs.push(obj1);
      await currentUser.save();

      let obj2 = {
        _id: _id,
        img: url,
        caption: caption,
        recUser: currentUser._id,
        createdAt: Date.now(),
        imageName: imageName,
      };
      chatUser.recImgs.push(obj2);
      await chatUser.save();

      /* req.flash("success", `Image sent to ${chatUser.username}`);
      res.redirect(`/chatWindow/${chatId}`); */
      res
        .status(200)
        .send({ success: true, img: url, createdAt: ImgDate, _id });
    }
  );
};

module.exports.delMsgs = async (req, res) => {
  try {
    let {
      currUser_id,
      chatUser_id,
      msgType,
      msgId,
      delType,
      is_img,
      img_Name,
    } = req.params;
    /* console.log(
  currUser_id,
  " ",
  chatUser_id,
  " ",
  msgType,
  " ",
  msgId,
  " ",
  delType,
  " ",
  img_Name
); */

    const folderPath = "SocialBook/Chats/";
    const imgName = `${folderPath}${img_Name}`;

    const chatUser = await User.findById(chatUser_id);
    const currUser = await User.findById(currUser_id);
    if (
      chatUser._id.toString() === currUser._id.toString() &&
      (delType === "delTypeM" || delType === "delTypeE") &&
      is_img === "false"
    ) {
      const sendMsgToUpdate = currUser.sendMsgs.find(
        (msg) =>
          msg._id.toString() === msgId.toString() && msg.isDeleted === false
      );
      const recMsgToUpdate = chatUser.recMsgs.find(
        (msg) =>
          msg._id.toString() === msgId.toString() && msg.isDeleted === false
      );

      if (sendMsgToUpdate && recMsgToUpdate) {
        sendMsgToUpdate.isDeleted = true;
        recMsgToUpdate.isDeleted = true;
        await currUser.save();
        await chatUser.save();
        /*   req.flash("success", `Message deleted Successfully`); */
        /* res.redirect(`/chatWindow/${chatUser._id}`); */
        res.status(200).send({
          success: true,
          chatUser_id: chatUser._id,
          currUser,
          chatUser,
        });
      } else {
        // Find the index of the message in the array
        const sendIndexToDelete = currUser.sendMsgs.findIndex(
          (msg) => msg._id.toString() === msgId.toString()
        );

        const recIndexToDelete = chatUser.recMsgs.findIndex(
          (msg) => msg._id.toString() === msgId.toString()
        );
        // Remove the message from the array
        currUser.recMsgs.splice(recIndexToDelete, 1);
        currUser.sendMsgs.splice(sendIndexToDelete, 1);

        await currUser.save();
        await chatUser.save();
        /* req.flash("success", `Message deleted Successfully`); */
        res.status(200).send({
          success: true,
          chatUser_id: chatUser._id,
          currUser,
          chatUser,
        });
      }
    } else if (
      chatUser._id.toString() === currUser._id.toString() &&
      (delType === "delTypeM" || delType === "delTypeE") &&
      is_img === "true"
    ) {
      const sendMsgToUpdate = currUser.sendImgs.find(
        (msg) =>
          msg._id.toString() === msgId.toString() && msg.isDeleted === false
      );
      const recMsgToUpdate = chatUser.recImgs.find(
        (msg) =>
          msg._id.toString() === msgId.toString() && msg.isDeleted === false
      );

      if (sendMsgToUpdate && recMsgToUpdate) {
        sendMsgToUpdate.isDeleted = true;
        recMsgToUpdate.isDeleted = true;
        await currUser.save();
        await chatUser.save();
        /* req.flash("success", `Image deleted Successfully`); */
        res.status(200).send({
          success: true,
          chatUser_id: chatUser._id,
          currUser,
          chatUser,
        });
      } else {
        // Find the index of the message in the array
        const sendIndexToDelete = currUser.sendImgs.findIndex(
          (msg) => msg._id.toString() === msgId.toString()
        );

        const recIndexToDelete = chatUser.recImgs.findIndex(
          (msg) => msg._id.toString() === msgId.toString()
        );
        // Remove the message from the array
        currUser.recImgs.splice(recIndexToDelete, 1);
        currUser.sendImgs.splice(sendIndexToDelete, 1);

        await currUser.save();
        await chatUser.save();

        cloudinary.uploader.destroy(imgName, (err, res) => {
          console.log(err, " ", res);
        });

        /* req.flash("success", `Image deleted Successfully`); */
        res.status(200).send({
          success: true,
          chatUser_id: chatUser._id,
          currUser,
          chatUser,
        });
      }
    } else if (
      delType === "delTypeM" &&
      msgType === "sendMsg" &&
      is_img === "true"
    ) {
      const msgToUpdate = currUser.sendImgs.find(
        (msg) =>
          msg._id.toString() === msgId.toString() && msg.isDeleted === false
      );

      if (msgToUpdate) {
        msgToUpdate.isDeleted = true;
        await currUser.save();
        /* req.flash("success", `Image deleted Successfully`); */
        res.status(200).send({
          success: true,
          chatUser_id: chatUser._id,
          currUser,
          chatUser,
        });
      } else {
        const msgToDelete = currUser.sendImgs.find(
          (msg) =>
            msg._id.toString() === msgId.toString() && msg.isDeleted === true
        );
        if (msgToDelete) {
          // Find the index of the message in the array
          const indexToDelete = currUser.sendImgs.findIndex(
            (msg) => msg._id.toString() === msgId.toString()
          );

          // Remove the message from the array
          currUser.sendImgs.splice(indexToDelete, 1);

          await currUser.save();

          const recMsgToDelete = chatUser.recImgs.find(
            (msg) =>
              msg._id.toString() === msgId.toString() && msg.isDeleted === false
          );
          if (!recMsgToDelete) {
            console.log("deleted");
            cloudinary.uploader.destroy(imgName, (err, res) => {
              console.log(err, " ", res);
            });
          }
          /* req.flash("success", `Image deleted Successfully`); */
          res.status(200).send({
            success: true,
            chatUser_id: chatUser._id,
            currUser,
            chatUser,
          });
        }
      }
    } else if (
      delType === "delTypeE" &&
      msgType === "sendMsg" &&
      is_img === "true"
    ) {
      const sendMsgToUpdate = currUser.sendImgs.find(
        (msg) =>
          msg._id.toString() === msgId.toString() && msg.isDeleted === false
      );
      const recMsgToUpdate = chatUser.recImgs.find(
        (msg) =>
          msg._id.toString() === msgId.toString() && msg.isDeleted === false
      );

      if (sendMsgToUpdate || recMsgToUpdate) {
        if (sendMsgToUpdate) {
          sendMsgToUpdate.isDeleted = true;
        }
        if (recMsgToUpdate) {
          recMsgToUpdate.isDeleted = true;
        }

        await currUser.save();
        await chatUser.save();
        /* req.flash("success", `Image deleted Successfully`); */
        res.status(200).send({
          success: true,
          chatUser_id: chatUser._id,
          currUser,
          chatUser,
        });
      }
    } else if (
      delType === "delTypeM" &&
      msgType === "recMsg" &&
      is_img === "true"
    ) {
      const msgToUpdate = currUser.recImgs.find(
        (msg) =>
          msg._id.toString() === msgId.toString() && msg.isDeleted === false
      );

      if (msgToUpdate) {
        msgToUpdate.isDeleted = true;
        await currUser.save();
        /* req.flash("success", `Image deleted Successfully`); */
        res.status(200).send({
          success: true,
          chatUser_id: chatUser._id,
          currUser,
          chatUser,
        });
      } else {
        const msgToDelete = currUser.recImgs.find(
          (msg) =>
            msg._id.toString() === msgId.toString() && msg.isDeleted === true
        );
        if (msgToDelete) {
          // Find the index of the message in the array
          const indexToDelete = currUser.recImgs.findIndex(
            (msg) => msg._id.toString() === msgId.toString()
          );

          // Remove the message from the array
          currUser.recImgs.splice(indexToDelete, 1);

          await currUser.save();

          const sendMsgToDelete = chatUser.sendImgs.find(
            (msg) =>
              msg._id.toString() === msgId.toString() && msg.isDeleted === false
          );
          if (!sendMsgToDelete) {
            cloudinary.uploader.destroy(imgName, (err, res) => {
              console.log(err, " ", res);
            });
          }
          /* req.flash("success", `Image deleted Successfully`); */
          res.status(200).send({
            success: true,
            chatUser_id: chatUser._id,
            currUser,
            chatUser,
          });
        }
      }
    } else if (
      delType === "delTypeM" &&
      msgType === "sendMsg" &&
      is_img === "false"
    ) {
      const msgToUpdate = currUser.sendMsgs.find(
        (msg) =>
          msg._id.toString() === msgId.toString() && msg.isDeleted === false
      );

      if (msgToUpdate) {
        msgToUpdate.isDeleted = true;
        await currUser.save();
        /* req.flash("success", `Message deleted Successfully`); */
        res.status(200).send({
          success: true,
          chatUser_id: chatUser._id,
          currUser,
          chatUser,
        });
      } else {
        const msgToDelete = currUser.sendMsgs.find(
          (msg) =>
            msg._id.toString() === msgId.toString() && msg.isDeleted === true
        );
        if (msgToDelete) {
          // Find the index of the message in the array
          const indexToDelete = currUser.sendMsgs.findIndex(
            (msg) => msg._id.toString() === msgId.toString()
          );

          // Remove the message from the array
          currUser.sendMsgs.splice(indexToDelete, 1);

          await currUser.save();
          /* req.flash("success", `Message deleted Successfully`); */
          res.status(200).send({
            success: true,
            chatUser_id: chatUser._id,
            currUser,
            chatUser,
          });
        }
      }
    } else if (
      delType === "delTypeE" &&
      msgType === "sendMsg" &&
      is_img === "false"
    ) {
      const sendMsgToUpdate = currUser.sendMsgs.find(
        (msg) =>
          msg._id.toString() === msgId.toString() && msg.isDeleted === false
      );
      const recMsgToUpdate = chatUser.recMsgs.find(
        (msg) =>
          msg._id.toString() === msgId.toString() && msg.isDeleted === false
      );

      if (sendMsgToUpdate || recMsgToUpdate) {
        if (sendMsgToUpdate) {
          sendMsgToUpdate.isDeleted = true;
        }
        if (recMsgToUpdate) {
          recMsgToUpdate.isDeleted = true;
        }
        await currUser.save();
        await chatUser.save();
        /* req.flash("success", `Message deleted Successfully`); */
        res.status(200).send({
          success: true,
          chatUser_id: chatUser._id,
          currUser,
          chatUser,
        });
      }
    } else if (
      delType === "delTypeM" &&
      msgType === "recMsg" &&
      is_img === "false"
    ) {
      const msgToUpdate = currUser.recMsgs.find(
        (msg) =>
          msg._id.toString() === msgId.toString() && msg.isDeleted === false
      );

      if (msgToUpdate) {
        msgToUpdate.isDeleted = true;
        await currUser.save();
        /* req.flash("success", `Message deleted Successfully`); */
        res.status(200).send({
          success: true,
          chatUser_id: chatUser._id,
          currUser,
          chatUser,
        });
      } else {
        const msgToDelete = currUser.recMsgs.find(
          (msg) =>
            msg._id.toString() === msgId.toString() && msg.isDeleted === true
        );
        if (msgToDelete) {
          // Find the index of the message in the array
          const indexToDelete = currUser.recMsgs.findIndex(
            (msg) => msg._id.toString() === msgId.toString()
          );

          // Remove the message from the array
          currUser.recMsgs.splice(indexToDelete, 1);

          await currUser.save();
          /* req.flash("success", `Message deleted Successfully`); */
          res.status(200).send({
            success: true,
            chatUser_id: chatUser._id,
            currUser,
            chatUser,
          });
        }
      }
    }
  } catch (error) {
    res.status(200).send({
      error: true,
      message: error.message || "Internal server Error",
    });
  }
};

module.exports.delAllMsgs = async (req, res) => {
  let { currUserId, chatUserId } = req.params;
  let currUser = await User.findById(currUserId);
  let chatUser = await User.findById(chatUserId);
  try {
    let sendImgToDelete = [];
    let recImgToDelete = [];
    // Find messages sent by current user to chat user
    sendImgToDelete = currUser.sendImgs.filter(
      (msg) => msg.sendUser.toString() === chatUserId.toString()
    );

    // Find messages received by current user from chat user
    recImgToDelete = currUser.recImgs.filter(
      (msg) => msg.recUser.toString() === chatUserId.toString()
    );

    if (sendImgToDelete) {
      for (img of sendImgToDelete) {
        const indexToDelete = currUser.sendImgs.findIndex(
          (msg) => msg._id.toString() === img._id.toString()
        );
        console.log(indexToDelete);
        // Remove the message from the array
        currUser.sendImgs.splice(indexToDelete, 1);

        const ToDelete = chatUser.recImgs.find(
          (msg) =>
            msg._id.toString() === img._id.toString() && msg.isDeleted === false
        );
        if (!ToDelete) {
          let imageName = img.imageName;
          cloudinary.uploader.destroy(imageName, (err, res) => {
            console.log(err, " ", res);
          });
        }
      }
    }

    if (recImgToDelete) {
      for (img of recImgToDelete) {
        const indexToDelete = currUser.recImgs.findIndex(
          (msg) => msg._id.toString() === img._id.toString()
        );
        // Remove the message from the array
        currUser.recImgs.splice(indexToDelete, 1);

        const ToDelete = chatUser.sendImgs.find(
          (msg) =>
            msg._id.toString() === img._id.toString() && msg.isDeleted === false
        );
        if (!ToDelete) {
          console.log("deleted");

          let imageName = img.imageName;
          cloudinary.uploader.destroy(imageName, (err, res) => {
            console.log(err, " ", res);
          });
        }
      }
    }

    let sendMsgToDelete = [];
    let recMsgToDelete = [];
    // Find messages sent by current user to chat user
    sendMsgToDelete = currUser.sendMsgs.filter(
      (msg) => msg.sendUser.toString() === chatUserId.toString()
    );

    // Find messages received by current user from chat user
    recMsgToDelete = currUser.recMsgs.filter(
      (msg) => msg.recUser.toString() === chatUserId.toString()
    );

    if (sendMsgToDelete) {
      for (msg of sendMsgToDelete) {
        const indexToDelete = currUser.sendMsgs.findIndex(
          (msg1) => msg1._id.toString() === msg._id.toString()
        );
        // Remove the message from the array
        currUser.sendMsgs.splice(indexToDelete, 1);
      }
    }

    if (recMsgToDelete) {
      for (msg of recMsgToDelete) {
        const indexToDelete = currUser.recMsgs.findIndex(
          (msg1) => msg1._id.toString() === msg._id.toString()
        );
        // Remove the message from the array
        currUser.recMsgs.splice(indexToDelete, 1);
      }
    }

    await currUser.save();
    res.status(200).send({ success: true });
  } catch (error) {
    res.status(400).send({ success: false, error: true });
  }
};

module.exports.getConversation = async (req, res) => {
  try {
    let { currUserID, chatUserID } = req.params;
    let chatUser = await User.findById(chatUserID);
    let conv = await Conversation.findOne({
      $or: [
        { sendUser: currUserID, recUser: chatUserID, forUser: currUserID },
        { sendUser: chatUserID, recUser: currUserID, forUser: currUserID },
      ],
    });

    if (conv) {
      // Fetch all messages in one go
      let msgs = await Message.find({ _id: { $in: conv.messages } });

      return res.status(200).send({
        success: true,
        found: true,
        conv,
        data: {
          lastSeen: chatUser.lastSeen,
          msgs,
          chatUser,
        },
      });
    }

    return res.status(200).send({
      success: true,
      found: false,
      data: {
        lastSeen: null,
        msgs: [],
        chatUser,
      },
    });
  } catch (error) {
    return res.status(200).send({
      error: true,
      msg: error.message,
    });
  }
};

module.exports.updateUserLastseen = async (req, res) => {
  try {
    let { userID } = req.params;
    await User.findByIdAndUpdate(userID, { lastSeen: Date.now() });
    return res.status(200).send({
      success: true,
    });
  } catch (error) {
    return res.status(200).send({
      error: true,
      msg: error.message,
    });
  }
};

module.exports.sendMsg = async (req, res) => {
  try {
    let { currUserID, chatUserID } = req.params;
    let { msgToSend } = req.body;

    let currUserName = await User.findById(currUserID).username;

    // let chatUser = await User.findById(chatUserID);
    let convCurr = await Conversation.findOne({
      $or: [
        {
          $and: [
            { sendUser: currUserID },
            { recUser: chatUserID },
            { forUser: currUserID },
          ],
        },
        {
          $and: [
            { sendUser: chatUserID },
            { recUser: currUserID },
            { forUser: currUserID },
          ],
        },
      ],
    });

    let convRec = await Conversation.findOne({
      $or: [
        {
          $and: [
            { sendUser: currUserID },
            { recUser: chatUserID },
            { forUser: chatUserID },
          ],
        },
        {
          $and: [
            { sendUser: chatUserID },
            { recUser: currUserID },
            { forUser: chatUserID },
          ],
        },
      ],
    });

    //create a new msg
    let msg = new Message();
    msg.msg = msgToSend;
    msg.sentByUserId = currUserID;
    msg.sentByUserName = currUserName;

    await msg.save();

    if (convCurr) {
      convCurr.messages.push(msg._id);
      await convCurr.save();
    } else {
      let newConvCurr = new Conversation();
      newConvCurr.sendUser = currUserID;
      newConvCurr.recUser = chatUserID;
      newConvCurr.messages = [];
      newConvCurr.forUser = currUserID;
      newConvCurr.messages.push(msg._id);

      await newConvCurr.save();
    }

    if (convRec) {
      convRec.messages.push(msg._id);
      await convRec.save();
    } else {
      let newConvRec = new Conversation();
      newConvRec.sendUser = currUserID;
      newConvRec.recUser = chatUserID;
      newConvRec.messages = [];
      newConvRec.forUser = chatUserID;
      newConvRec.messages.push(msg._id);

      await newConvRec.save();
    }

    res.status(200).send({
      success: true,
      msg,
    });
  } catch (error) {
    console.log(error);
    res.status(200).send({
      error: true,
      msg: error,
    });
  }
};

module.exports.clearChats = async (req, res) => {
  // try {
  let { currUserID, chatUserID } = req.params;

  let convCurr = await Conversation.findOne({
    $or: [
      { sendUser: currUserID, recUser: chatUserID, forUser: currUserID },
      { sendUser: chatUserID, recUser: currUserID, forUser: currUserID },
    ],
  });

  let convRec = await Conversation.findOne({
    $or: [
      { sendUser: currUserID, recUser: chatUserID, forUser: chatUserID },
      { sendUser: chatUserID, recUser: currUserID, forUser: chatUserID },
    ],
  });

  if (convRec) {
    convCurr.messages.forEach(async (msg) => {
      if (!convRec.messages.includes(msg)) {
        //remove that msg from convCurr and convRec and also delete a msg
        convRec.messages = convRec.messages.filter(
          (element) => element !== msg
        );
        convCurr.messages = convCurr.messages.filter(
          (element) => element !== msg
        );

        await Message.findByIdAndDelete(msg);
      }
    });

    await convRec.save();
  } else if (convCurr) {
    convCurr.messages.forEach(async (msg) => {
      await Message.findByIdAndDelete(msg);
    });
  }

  // convCurr.messages.length = 0;
  // await convCurr.save();
  await Conversation.findByIdAndDelete(convCurr?._id);

  res.status(200).send({
    success: true,
  });
  // } catch (e) {
  //   res.status(200).send({
  //     success: false,
  //     error: true,
  //   });
  // }
};
