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
  log: [],
});

exSchema.methods.toJSON = function () {
  var obj = this.toObject();
  delete obj._id;
  delete obj.__v;
  return obj;
};

userSchema.methods.toJSON = function () {
  var obj = this.toObject();
  delete obj.log;
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

app.post("/api/users/:_id/exercises", async (req, res) => {
  const { description, duration, date } = req.body;
  let exercise = new Exercise({
    description: description,
    duration: duration,
    date: new Date(date).toDateString(),
  });

  if (exercise.date === "") {
    exercise.date = new Date().toDateString();
  }

  let user = User.findByIdAndUpdate(
    req.params._id,
    { $push: { log: exercise } },
    { new: true }
  ).then((result) => {
    let resObj = {};
    resObj["_id"] = result._id;
    resObj["username"] = result.username;
    resObj["date"] = new Date(exercise.date).toDateString();
    resObj["duration"] = exercise.duration;
    resObj["description"] = exercise.description;

    res.json(resObj);
  });
});
//----------------------------------------------------------------------------//
