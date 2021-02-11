const jwt = require("jsonwebtoken");
const jwtKey = require("../config/keys").secretTokenId;
const auth = (req, res, next) => {
  try {
    const token = req.header("x-auth-token");
    // console.log(token);
    if (!token) return res.status(404).json({ msg: "no authantication token" });
    const varified = jwt.verify(token, jwtKey);

    if (!varified)
      return res.status(401).json({ msg: "Token validation faild .." });
    req.user = varified.id;

    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = auth;
