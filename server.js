const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const bodyParser = require("body-parser");

const app = express();

const users = require("./Routes/api/users");

// Port
const Port = process.env.PORT || 8000;

//Bodyparser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//  cors middleware for interacting/communicate two port at a time
app.use(cors());
// db connection / config
const db = require("./config/keys");
mongoose
  .connect(db.mongodbURL, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log("connection successfully ...");
  })
  .catch(() => console.log("Internal server Error"));

// Use Routes (middle ware) // if user hit the url /api/v1/user then to goes to users variable (../Routes/api/users)

app.use("/api/v1/user", users);

app.listen(Port, () => {
  console.log(`server started on port ${Port}`);
});
