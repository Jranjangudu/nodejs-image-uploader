const mongoose = require("mongoose");
const Schema = mongoose.Schema;
//Create schema
const Userschema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    confirmpassword: {
      type: String,
    },
    profile: {
      type: String,
      default: "Userprofile",
    },

    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

//Create model

module.exports = User = mongoose.model("Users", Userschema);
