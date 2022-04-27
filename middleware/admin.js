import Issue from "../models/issue.js";
import Admin from "../models/admin.js";
import Book from "../models/book.js";
import User from "../models/user.js";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export const getlogin = (req, res) => {
  if (req.user) {
    res.redirect("dashboard");
  } else {
    res.render("admin/adminlogin");
  }
};

export const dashboard = async (req, res) => {
  try {
    const issues = await Issue.find({});
    res.render("admin/dashboard", { userdata: req.user, issues: issues });
  } catch (error) {}
};

export const getregister = (req, res) => {
  res.render("admin/adminregister");
};

export const register = async (req, res) => {
  const { username, email, password, mobile } = req.body;

  const hashedpassword = await bcrypt.hash(password, 12);

  const admin = new Admin({
    username,
    email,
    password: hashedpassword,
    mobile,
  });
  try {
    await admin.save();
    res.render("admin/adminlogin");
  } catch (error) {
    res.redirect("/");
  }
};

export const login = async (req, res) => {
  const { username, password } = req.body;

  const userexits = await Admin.findOne({ username });

  if (!userexits) return res.status(400).send("User not exists");

  const validpassword = await bcrypt.compare(password, userexits.password);

  if (!validpassword) return res.status(400).send("Invalid Password");

  // creating a token

  const token = jwt.sign(
    {
      id: userexits._id,
      username: userexits.username,
    },
    process.env.SECRET
  );

  // Setting jwt token in cookie as 'access_token'
  res.cookie("access_token", token, {
    maxAge: 9000000,
    httpOnly: true,
  });

  res.redirect("/admin/dashboard");
};

export const getaddbook = (req, res) => {
  res.render("admin/addbook");
};

export const addbook = async (req, res) => {
  const { title, author, copies, category, description } = req.body;
  const ISBN = uuidv4();

  const book = new Book({
    title,
    author,
    stock: copies,
    category,
    description,
    ISBN,
  });

  try {
    await book.save();
    res.redirect("addbook");
  } catch (error) {
    console.log(error);
  }
};

export const bookdetails = async (req, res) => {
  try {
    const books = await Book.find({});
    res.render("admin/bookdetails", { books: books });
  } catch (error) {
    res.redirect("back");
  }
};

export const profile = async (req, res) => {
  try {
    const profile = await Admin.findOne({ username: req.user.username });
    res.render("admin/profile", { profile: profile });
  } catch (err) {
    console.log(err);
  }
};

export const userdetails = async (req, res) => {
  try {
    const users = await User.find({});
    res.render("admin/userdetails", { users: users });
  } catch (err) {
    console.log(err);
  }
};

export const deletebook = async (req, res) => {
  try {
    await Book.findByIdAndRemove(req.params.id);
  } catch (error) {
    console.log(error);
  }

  res.redirect("back");
};

export const editbook = async (req, res) => {
  const { title, author, category, description } = req.body;
  Book.updateOne(
    { _id: req.params.id },
    {
      $set: {
        title,
        author,
        category,
        description,
      },
    },
    (err) => {
      if (err) {
        console.log(err);
      } else {
        res.redirect("/admin/bookdetails");
      }
    }
  );
};

export const geteditbook = async (req, res) => {
  const book = await Book.findById(req.params.id);
  res.render("admin/editbook", { book: book });
};

export const bookdetail = async (req, res) => {
  const book = await Book.findById(req.params.id);
  res.render("admin/singlebook", { book: book });
};

export const logout = (req, res) => {
  res.clearCookie("access_token");
  res.redirect("/");
};
