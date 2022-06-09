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
});

let User = mongoose.model("User", userSchema);
let Exercise = mongoose.model("Exercise", exerciseSchema);
//----------------------------------------------------------------------------//

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});
