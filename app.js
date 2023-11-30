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

const usersRouter = require("./routes/user.js");
const postsRouter = require("./routes/post.js");
const storyRouter = require("./routes/story.js");
const msgRouter = require("./routes/message.js");

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

app.listen(process.env.PORT, () => {
  console.log("listing to port 8080");
});

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

app.get("/", async (req, res) => {
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
  });
});

app.use("/", usersRouter);
app.use("/", postsRouter);
app.use("/", storyRouter);
app.use("/", msgRouter);
