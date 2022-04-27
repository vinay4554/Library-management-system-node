import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
  // get cookieToken
  let cookieToken = req.cookies["useraccess_token"];

  jwt.verify(cookieToken, process.env.SECRET, (err, data) => {
    if (err) {
      return res.redirect("/user/login"); // forbidden
    }
    req.token = cookieToken;
    req.user = data;
    next();
  });
};

export const autologin = (req, res, next) => {
  // get cookieToken
  let cookieToken = req.cookies["useraccess_token"];

  jwt.verify(cookieToken, process.env.SECRET, (err, data) => {
    if (err) {
      // forbidden
      req.token = null;
      req.user = null;
    } else {
      req.token = cookieToken;
      req.user = data;
    }

    next();
  });
};

export default verifyToken;
