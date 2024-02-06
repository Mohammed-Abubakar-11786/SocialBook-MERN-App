/* if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
} */

const { v4: uuidv4 } = require("uuid");
const Message = require("../models/message");
const User = require("../models/user.js");
const luxon = require("luxon");
const multer = require("multer");
const { storage, cloudinary } = require("../cloudConfig.js");
const upload = multer({ storage });

/* const { MongoClient } = require("mongodb");
const mongoURI = `${process.env.ATLASDB_URL}`; */

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
  /* 
  let isChanged = false;

  async function setupChangeStream() {
    const client = new MongoClient(mongoURI, { useUnifiedTopology: true });

    try {
      await client.connect();

      const database = client.db("test");
      const collection = database.collection("users");

      // Set up a change stream on the collection
      const changeStream = collection.watch();

      // Listen for changes
      changeStream.on("change", (change) => {
        // Notify connected clients about the change
        isChanged = true;
      });

      console.log("Change stream is set up.");
    } catch (error) {
      console.error("Error setting up change stream:", error);
    }
  }

  // Call the setupChangeStream function
  setupChangeStream(); */

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
    createdAt: Date.now(),
  };
  currentUser.sendMsgs.push(obj1);
  await currentUser.save();

  let obj2 = {
    _id: _id,
    msg: msg,
    recUser: currentUser._id,
    createdAt: Date.now(),
  };
  chatUser.recMsgs.push(obj2);
  await chatUser.save();

  /*   req.flash("success", `Message sent to ${chatUser.username}`); */
  /* res.redirect(`/chatWindow/${chatId}`) */
  res.status(200).send({ success: true, msg: msg, createdAt: msgDate });
};

module.exports.saveImg = async (req, res) => {
  let { chatId } = req.params;
  let { caption } = req.body;

  /* let url = req.file.path; */
  /*  console.log(req.files.chatImg); the file to upload */
  const uploadOptions = { folder: "SocialBook" };
  const file = req.files.chatImg;
  cloudinary.uploader.upload(
    file.tempFilePath,
    uploadOptions,
    async (err, result) => {
      let url = result.url;
      // Find user with chatID
      const chatUser = await User.findById(chatId).exec();

      // Find user with currUser._id
      const currentUser = await User.findById(req.user._id).exec();

      const _id = uuidv4();

      let obj1 = {
        _id: _id,
        img: url,
        caption: caption,
        sendUser: chatUser._id,
        createdAt: Date.now(),
      };

      currentUser.sendImgs.push(obj1);
      await currentUser.save();

      let obj2 = {
        _id: _id,
        img: url,
        caption: caption,
        recUser: currentUser._id,
        createdAt: Date.now(),
      };
      chatUser.recImgs.push(obj2);
      await chatUser.save();

      req.flash("success", `Image sent to ${chatUser.username}`);
      res.redirect(`/chatWindow/${chatId}`);
    }
  );
};

module.exports.delMsgs = async (req, res) => {
  let { currUser_id, chatUser_id, msgType, msgId, delType, is_img, img_Name } =
    req.params;
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

  const folderPath = "SocialBook/";
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
      req.flash("success", `Message deleted Successfully`);
      res.redirect(`/chatWindow/${chatUser._id}`);
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
      req.flash("success", `Message deleted Successfully`);
      res.redirect(`/chatWindow/${chatUser._id}`);
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
      req.flash("success", `Image deleted Successfully`);
      res.redirect(`/chatWindow/${chatUser._id}`);
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

      req.flash("success", `Image deleted Successfully`);
      res.redirect(`/chatWindow/${chatUser._id}`);
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
      req.flash("success", `Image deleted Successfully`);
      res.redirect(`/chatWindow/${chatUser._id}`);
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
        req.flash("success", `Image deleted Successfully`);
        res.redirect(`/chatWindow/${chatUser._id}`);
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
      req.flash("success", `Image deleted Successfully`);
      res.redirect(`/chatWindow/${chatUser._id}`);
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
      req.flash("success", `Image deleted Successfully`);
      res.redirect(`/chatWindow/${chatUser._id}`);
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
        req.flash("success", `Image deleted Successfully`);
        res.redirect(`/chatWindow/${chatUser._id}`);
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
      req.flash("success", `Message deleted Successfully`);
      res.redirect(`/chatWindow/${chatUser._id}`);
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
        req.flash("success", `Message deleted Successfully`);
        res.redirect(`/chatWindow/${chatUser._id}`);
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
      req.flash("success", `Message deleted Successfully`);
      res.redirect(`/chatWindow/${chatUser._id}`);
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
      req.flash("success", `Message deleted Successfully`);
      res.redirect(`/chatWindow/${chatUser._id}`);
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
        req.flash("success", `Message deleted Successfully`);
        res.redirect(`/chatWindow/${chatUser._id}`);
      }
    }
  }
};
