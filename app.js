if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}
const express = require("express");
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

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "/public")));
app.engine("ejs", ejsMate);

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
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", () => {
  console.log("Error in MONGO SESSION STORE", err);
});

let sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};
app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
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
let io = require("socket.io")(http);
let usp = io.of("/user_namespace");
let grp = io.of("/groupChatNameSpace");

app.get("/", async (req, res) => {
  let currUser = req.user;
  const allPosts = await Post.find({}).populate("owner");
  const allStories = await Story.find({}).populate("owner");
  const allUsers = await User.find({});
  // Sort the 'allPosts' array based on the 'createdAt' property in descending order
  const sortedPosts = allPosts.sort((a, b) => b.createdAt - a.createdAt);

  // Render your EJS template with the sorted posts
  res.render("index.ejs", {
    allStories,
    allUsers,
    luxon,
    allPosts: sortedPosts,
    currUser,
  });
});

usp.on("connection", async (socket) => {
  console.log("user-Connected");
  let currUserID = socket.handshake.auth.token;
  await User.findByIdAndUpdate(currUserID, { is_online: true });

  socket.broadcast.emit("userOnline", { user_id: currUserID });

  socket.on("msgSent", async (data) => {
    usp.emit("receiveMsg", data);
  });

  //to sence the img sent
  socket.on("imgSent", (data) => {
    usp.emit("receiveImg", data);
  });

  socket.on("sendDelete", async (data) => {
    let currentUser = await User.findById(data.currUser_id);
    let chatUser = await User.findById(data.chatUser_id);
    let Data = {
      currentUser,
      chatUser,
      currUser_id: data.currUser_id,
      chatUser_id: data.chatUser_id,
      msgType: data.msgType,
      msgId: data.msgId,
      delType: data.delType,
      is_img: data.is_img,
      imgURL: data.imgURL,
    };
    usp.emit("recDelete", Data);
  });

  socket.on("likeBtnClicked", (data) => {
    usp.emit("incLikeCount", data);
  });

  socket.on("cmtAdded", (data) => {
    socket.broadcast.emit("appendCmt", data);
  });

  socket.on("disconnect", async () => {
    console.log("user-disconnected");
    await User.findByIdAndUpdate(currUserID, { is_online: false });
    socket.broadcast.emit("userOffline", { user_id: currUserID });
  });
});

grp.on("connection", async (socket) => {
  console.log("Group-user-Connected");
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

  socket.on("disconnect", async () => {
    console.log("group-user-disconnected");
    let disCntTime = Date.now();
    await User.findByIdAndUpdate(currUserID, { is_online_in_group: false });
    grp.emit("GroupUserOffline", { currUser, disCntTime });
  });
});
app.use("/", usersRouter);
app.use("/", postsRouter);
app.use("/", storyRouter);
app.use("/", msgRouter);
app.use("/", grpMsgsRouter);

const PORT = process.env.PORT || 3030;

http.listen(PORT, () => {
  console.log(`listing to port ${PORT}`);
});
