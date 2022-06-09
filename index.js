const express = require("express");
const app = express();

const cors = require("cors");

const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const dotenv = require("dotenv");

dotenv.config({ path: "./config/config.env" });

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;

app.listen(PORT, console.log(`App is listening on port ${PORT}`));

let uri = process.env.URI;
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

//--------------------------Creating Models------------------------------------//
let exSchema = new mongoose.Schema({
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: String,
});

let userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  log: [exSchema],
  count: { type: Number },
});

exSchema.methods.toJSON = function () {
  var obj = this.toObject();
  // delete obj._id;
  delete obj.__v;
  return obj;
};

userSchema.methods.toJSON = function () {
  var obj = this.toObject();
  delete obj.__v;

  return obj;
};

let User = mongoose.model("User", userSchema);
let Exercise = mongoose.model("Exercise", exSchema);
//----------------------------------------------------------------------------//

//--------------------------Creating Routes------------------------------------//
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.post("/api/users", async (req, res) => {
  const { username } = req.body;
  let user = await User.findOne({ username: req.body.username });
  if (!user) {
    user = new User({ username: username });
    await user.save();

    res.status(200).json(user);
  } else {
    res.status(400).send("This user already exists.");
  }
});

app.get("/api/users", (req, res) => {
  User.find()
    .then((result) => res.status(200).json(result))
    .catch((error) => res.status(400).send(error));
});

const getDate = (date) => {
  if (!date) {
    return new Date().toDateString();
  }
  const correctDate = new Date();
  const dateString = date.split("-");
  correctDate.setFullYear(dateString[0]);
  correctDate.setDate(dateString[2]);
  correctDate.setMonth(dateString[1] - 1);

  return correctDate.toDateString();
};

app.post("/api/users/:_id/exercises", async (req, res) => {
  const { description, duration, date } = req.body;

  let exercise = new Exercise({
    description: description,
    duration: duration,
    date: getDate(date),
  });

  await exercise.save();

  let user = User.findByIdAndUpdate(
    req.params._id,
    { $push: { log: exercise } },
    { new: true }
  ).then((result) => {
    let resObj = {};
    resObj["_id"] = result._id;
    resObj["username"] = result.username;
    resObj["date"] = exercise.date;
    resObj["duration"] = exercise.duration;
    resObj["description"] = exercise.description;

    res.json(resObj);
  });
});

app.post("/api/users/:_id/logs");

app.get("/api/users/:_id/logs", (req, res) => {
  User.findById(req.params._id).then((result) => {
    res.json(result);
  });
});
//----------------------------------------------------------------------------//
