const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const ejsMate = require("ejs-mate");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "/public")));
app.engine("ejs", ejsMate);

app.listen(3030, () => {
  console.log("listing to port 3030");
});

/* const MongoUrl = "mongodb://127.0.0.1:27017/NetworkSite";

main()
  .then(() => {
    console.log("Connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MongoUrl);
} */

app.get("/", (req, res) => {
  res.render("index.ejs");
});
