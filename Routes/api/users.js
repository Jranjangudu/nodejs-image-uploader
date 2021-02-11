const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const cloudinary = require("cloudinary").v2;
const validator = require("validator");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const Upload = require("../../model/Upload");

const jwt = require("jsonwebtoken");
//User Module(model name)
const User = require("../../model/User");
// Jwt Secretkeys access
const Secretkeys = require("../../config/keys");
//auth
const auth = require("../../middleware/auth");
const path = require("path");

//image upload to cloudinary
cloudinary.config({
  cloud_name: Secretkeys.cloud_name,
  api_key: Secretkeys.api_key,
  api_secret: Secretkeys.api_secret,
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, uuidv4() + "-" + Date.now() + path.extname(file.originalname));
  },
});
const fileFilter = (req, file, cb) => {
  const allowedFileTypes = ["image/jpeg", "image/jpg", "image/png"];
  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
let uploads = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024,
  },
  fileFilter,
});
// image upload =  post request = /api/v1/user/post/upload
// "images" is comes from cliend side / front end  , its a name of "file" field
router.post("/upload", uploads.single("images"), async (req, res, next) => {
  try {
    // here the image upload to cloudinary
    const cloudRes = await cloudinary.uploader.upload(req.file.path);
    const uploadfile = {
      image: cloudRes.secure_url,
      comment: req.body.usercomment,
      username: req.body.username,
      // here 'usercomment' and 'username' is a  input field name that comes from frontend
    };
    const UploadRes = await new Upload({
      //secure_url = https (secure)
      //url = http (not secure)
      uploadimages: uploadfile.image,
      comments: uploadfile.comment,
      name: uploadfile.username,
    });
    const response = await UploadRes.save();

    res.status(200).json(response);
  } catch (error) {
    if (limits.fileSize >= 1024 * 1024)
      return res.status(500).json({ message: "File Size is too large. " });

    res.status(500).json({ message: "Unable to upload your image" });
  }
});

router.post("/likes/:id", async (req, res) => {
  let result = await Upload.findById(req.params.id);

  await Upload.findById(req.params.id).updateOne({
    $set: { likes: result.likes + 1 },
  });
  let likedata = await Upload.findById(req.params.id);
  res.status(200).json(likedata);
  // console.log(likedata);
});
router.get("/count/like/:id", async (req, res) => {
  let data = await Upload.findById(req.params.id);
  res.status(200).json(data);
});
// Image gat , get request = /api/v1/user/image/server/res/
router.get("/image/server/", async (req, res) => {
  try {
    const ImageRes = await Upload.find();
    res.status(200).json(ImageRes);
  } catch (error) {
    res.status(500).json({ message: "Server side Error 500" });
  }
});

// post request = /api/v1/user/post/data/
router.post("/post/data/", async (req, res) => {
  const { name, email, password, confirmpassword } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ msg: "All fild are required .." });
  const emailvalidate = validator.isEmail(email);
  if (!emailvalidate)
    return res.status(400).json({ msg: "Invalid Email id. " });
  if (password.length < 5)
    return res
      .status(400)
      .json({ msg: "password most be 5 or more character .." });
  if (password !== confirmpassword)
    return res.status(400).json({
      msg: "password not match , please enter same password twice ..",
    });
  const Existemail = await User.findOne({ email: email });
  if (Existemail)
    return res
      .status(400)
      .json({ msg: "This email already exist , please enter another email ." });
  // hashing the pasword
  const salt = await bcrypt.genSalt(12);
  const hashpassword = await bcrypt.hash(password, salt);

  try {
    const Newdata = await new User({
      name: req.body.name,
      email: req.body.email,
      password: hashpassword,
    });
    const Usernewdata = await Newdata.save();
    res.status(201).json(Usernewdata);
  } catch (error) {
    res.status(404).json({ success: false });
  }
});
// post url =  /api/v1/user/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user)
      return res.status(500).json({
        passwordmsg: "no account with this email has been registered",
      });
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res.status(400).json({
        passwordmsg: "Your password / email not match , try again . ",
      });
    // JWt token generate
    const token = jwt.sign({ id: user._id }, Secretkeys.secretTokenId);
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ msg: "Internal server error." });
  }
});
// delete request =/api/v1/user/:id
router.delete("/delete/image/:id", async (req, res) => {
  try {
    //this userId comes to auth module
    const deleteuser = await Upload.findByIdAndDelete(req.params.id);
    res.json(deleteuser);
  } catch (error) {
    res.status(500).json({ success: false });
  }
});
//url= /api/v1/user/tokenverification
router.post("/tokenIsvalid", async (req, res) => {
  try {
    const token = req.header("x-auth-token");

    if (!token) return res.json(false);

    const varified = jwt.verify(token, Secretkeys.secretTokenId);

    if (!varified) return res.json(false);

    const user = await User.findById(varified.id);

    if (!user) return res.status(404).json({ message: false });
    return res.json(true);
  } catch (error) {
    res.status(500).json({ success: false });
  }
});
// Get request =/api/v1/user
// '/' means user hit /api/v1/user in url , then it call / render the get request
router.get("/", auth, async (req, res) => {
  try {
    const Userdata = await User.findById(req.user);

    res.json({
      name: Userdata.name,
      id: Userdata._id,
      email: Userdata.email,
    });
  } catch (error) {
    res.status(500).json({ msg: error });
  }
});

module.exports = router;
