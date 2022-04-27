import express from "express";
const router = express.Router();
import verify, { autologin } from "../auth/adminauth/admin.js";
import {
  getlogin,
  dashboard,
  register,
  login,
  addbook,
  bookdetails,
  profile,
  userdetails,
  deletebook,
  editbook,
  logout,
  bookdetail,
  geteditbook,
  getregister,
  getaddbook,
  geteditpassword,
  editpassword,
} from "../middleware/admin.js";

// admin auth routes
router.get("/login", autologin, getlogin);
router.get("/register", verify, getregister);
router.get("/dashboard", verify, dashboard);
router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);

// book routes
router.get("/addbook", verify, getaddbook);
router.post("/addbook", verify, addbook);
router.get("/bookdetails", bookdetails);
router.get("/bookdetail/:id", bookdetail);
router.get("/edit/:id", verify, geteditbook);
router.post("/edit/:id", verify, editbook);
router.get("/delete/:id", deletebook);

// getting Admin profile
router.get("/profile", verify, profile);
router.get("/userdetails", verify, userdetails);

// edit details
router.get("/editpassword", verify, geteditpassword);
router.post("/editpassword", verify, editpassword);

export default router;
