const mongoose = require("mongoose");
const Schema = mongoose.Schema;
//Create schema
const UserUploadSchema = new Schema(
  {
    uploadimages: {
      type: String,
      // required: true,
    },
    comments: {
      type: String,
    },
    name: {
      type: String,
    },
    likes: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

//Create model

module.exports = Upload = mongoose.model("Upload", UserUploadSchema);
