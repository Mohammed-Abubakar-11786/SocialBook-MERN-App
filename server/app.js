if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}
const cors = require("cors");
const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const flash = require("connect-flash");
const Post = require("./models/post");
const Story = require("./models/story");
const User = require("./models/user.js");
const luxon = require("luxon");
const fileUpload = require("express-fileupload");

const usersRouter = require("./routes/user.js");
const postsRouter = require("./routes/post.js");
const storyRouter = require("./routes/story.js");
const msgRouter = require("./routes/message.js");
const grpMsgsRouter = require("./routes/GroupMsg.js");
const adminRouter = require("./routes/admin.js");

const { Server } = require("socket.io");
//  Always define the middleware for course before any middleware else no header found error could be shown in production
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true,
  })
);
app.use(cookieParser());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "/public")));
app.engine("ejs", ejsMate);
app.use(express.json());

/* const MongoUrl = "mongodb://127.0.0.1:27017/NetworkSite"; */
const dbUrl = process.env.ATLASDB_URL;
main()
  .then(() => {
    console.log("Connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dbUrl);
}

app.use(
  fileUpload({
    useTempFiles: true,
  })
);

const store = MongoStore.create({
  mongoUrl: dbUrl,
  collectionName: "sessions",
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 7 * 24 * 60 * 60 * 1000,
  ttl: 7 * 24 * 60 * 60 * 1000, // Session TTL: 7 days
});

store.on("error", () => {
  console.log("Error in MONGO SESSION STORE", err);
});

// export { store };

let sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 1 * 60 * 60 * 1000, //only one hour
    maxAge: 1 * 60 * 60 * 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV == "production",
    sameSite: "strict", // Required for cross-site cookies
    // domain: ".onrender.com", // Allows access on both subdomains
  },
};
app.use(session(sessionOptions));
app.use(flash());
app.use(passport.session());

app.use(passport.initialize());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

const http = require("http").Server(app);
const io = new Server(http, {
  cors: {
    origin: process.env.FRONTEND_URL, // Use environment variable or fallback to localhost
    credentials: true,
  },
});
let usp = io.of("/user_namespace");
let csk = io.of("/chat_namespace");
let grp = io.of("/groupChatNameSpace");

csk.on("connection", async (socket) => {
  let currUserID = socket.handshake.auth.token;
  // await User.findByIdAndUpdate(currUserID, { is_online: true });
  // console.log("user online");
  // socket.broadcast.emit("setUserOnline", { user_id: currUserID });
  socket.on("userOnline", async (data) => {
    await User.findByIdAndUpdate(data.user_id, { is_online: true });
    socket.broadcast.emit("setUserOnline", data);
  });

  socket.on("sendMsg", async (data) => {
    socket.broadcast.emit("receiveMsg", data);
  });

  socket.on("notTyping", (data) => {
    socket.broadcast.emit("setNotTyping", data);
  });

  socket.on("typing", (data) => {
    socket.broadcast.emit("setTyping", data);
  });

  socket.on("userOffline", async (data) => {
    await User.findByIdAndUpdate(data.user_id, { is_online: false });
    socket.broadcast.emit("setUserOfline", data);
  });

  // socket.on("disconnect", async () => {
  //   await User.findByIdAndUpdate(currUserID, { is_online: false });
  //   socket.broadcast.emit("setUserOffline", { user_id: currUserID });
  // });
});

usp.on("connection", async (socket) => {
  // let currUserID = socket.handshake.auth.token;
  // await User.findByIdAndUpdate(currUserID, { is_online: true });

  socket.on("sendMsg", async (data) => {
    socket.broadcast.emit("receiveMsg", data);
  });

  // //to sence the img sent
  // socket.on("imgSent", (data) => {
  //   usp.emit("receiveImg", data);
  // });

  // socket.on("sendDelete", async (data) => {
  //   let currentUser = await User.findById(data.currUser_id);
  //   let chatUser = await User.findById(data.chatUser_id);
  //   let Data = {
  //     currentUser,
  //     chatUser,
  //     currUser_id: data.currUser_id,
  //     chatUser_id: data.chatUser_id,
  //     msgType: data.msgType,
  //     msgId: data.msgId,
  //     delType: data.delType,
  //     is_img: data.is_img,
  //     imgURL: data.imgURL,
  //   };
  //   usp.emit("recDelete", Data);
  // });

  socket.on("likeBtnClicked", (data) => {
    socket.broadcast.emit("incLikeCount", data);
  });

  socket.on("incShareCount", (data) => {
    usp.emit("increseShareCount", data);
  });

  socket.on("cmtAdded", (data) => {
    socket.broadcast.emit("appendCmt", data);
  });

  socket.on("sendPost", (data) => {
    socket.broadcast.emit("addNewPost", data);
  });

  socket.on("newStory", (data) => {
    usp.emit("addNewStory", data); // Emit to others
  });
});

grp.on("connection", async (socket) => {
  /* console.log("Group-user-Connected"); */
  let cntTime = Date.now();
  let currUserID = socket.handshake.auth.token;
  await User.findByIdAndUpdate(currUserID, { is_online_in_group: true });

  let currUser = await User.findById(currUserID);

  grp.emit("GroupUserOnline", { currUser, cntTime }); /* 
    socket.broadcast.emit("GroupUserOffline", { currUser }); */

  socket.on("grpMsgSent", async (data) => {
    socket.broadcast.emit("recGrpMsg", data);
  });

  socket.on("msgDeleted", (data) => {
    socket.broadcast.emit("recDeletedMsg", data);
  });

  socket.on("allMsgsDeleted", () => {
    socket.broadcast.emit("recAllMsgsDeleted");
  });

  socket.on("disconnect", async () => {
    let disCntTime = Date.now();
    await User.findByIdAndUpdate(currUserID, { is_online_in_group: false });
    grp.emit("GroupUserOffline", { currUser, disCntTime });
  });
});

app.get("/", async (req, res) => {
  let currUser = req.user;
  const allPosts = await Post.find({}).populate("owner");
  let allStories = await Story.find({}).populate("owner");

  // Sort the 'allStories' array based on the 'createdAt' property in descending order
  allStories.sort((a, b) => b.createdAt - a.createdAt);

  const allUsers = await User.find({});
  // Sort the 'allPosts' array based on the 'createdAt' property in descending order
  const sortedPosts = allPosts.sort((a, b) => b.createdAt - a.createdAt);

  // Render your EJS template with the sorted posts
  // res.render("index.ejs", {
  //   allStories,
  //   allUsers,
  //   luxon,
  //   allPosts: sortedPosts,
  //   currUser,
  // });

  res.status(200).send({
    allStories,
    allUsers,
    luxon,
    allPosts: sortedPosts,
    currUser,
  });
});

// app.get("delUser/:userID", async (req, res) => {
//   try {
//     console.log("in server");
//     let { userID } = req.params;
//     await User.findByIdAndDelete(userID);

//     res.status(200).send({
//       success: true,
//     });
//   } catch (e) {
//     res.status(200).send({
//       error: true,
//       msg: e.message,
//     });
//   }
// });

app.get("/abu", (req, res) => {
  res.send("Abubakar");
});
app.use("/", usersRouter);
app.use("/", postsRouter);
app.use("/", storyRouter);
app.use("/", msgRouter);
app.use("/", grpMsgsRouter);
app.use("/", adminRouter);

app.get("*", (req, res) => {
  // res.render("otherPages/pageNotFound.ejs");
  res.status(200).send({
    error: true,
    msg: "Page Not Found",
  });
});
const PORT = process.env.PORT || 3030;

http.listen(PORT, () => {
  console.log(`listing to port ${PORT}`);
});
