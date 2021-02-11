require("dotenv").config();
module.exports = {
  mongodbURL: process.env.DB_HOST,
  secretTokenId: process.env.SECRATE_KEY,
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
};
