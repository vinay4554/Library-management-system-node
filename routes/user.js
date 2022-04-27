import express from "express";
import verify, { autologin } from "../auth/userauth/user.js";
const router = express.Router();
import {
  dashboard,
  getissuebook,
  getlogin,
  getregister,
  getreturnbook,
  issuebook,
  login,
  logout,
  profile,
  register,
  returnbook,
} from "../middleware/user.js";

router.get("/login", autologin, getlogin);
router.get("/register", getregister);
router.get("/dashboard", verify, dashboard);
router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);

// handling book routes
router.get("/issuebook", getissuebook);
router.get("/issue/:bookid", verify, issuebook);
router.get("/returnbook", verify, getreturnbook);
router.get("/return/:id", verify, returnbook);

// profile
router.get("/profile", verify, profile);

export default router;
