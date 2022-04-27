import Issue from "../models/issue.js";
import Admin from "../models/admin.js";
import Book from "../models/book.js";
import User from "../models/user.js";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import flash from "connect-flash";

export const getlogin = (req, res) => {
  if (req.user) {
    res.redirect("dashboard");
  } else {
    const message = req.flash("message");
    res.render("admin/adminlogin", { message: message });
  }
};

export const dashboard = async (req, res) => {
  try {
    const issues = await Issue.find({});
    res.render("admin/dashboard", { userdata: req.user, issues: issues });
  } catch (error) {}
};

export const getregister = (req, res) => {
  const message = req.flash("message");
  res.render("admin/adminregister", { message: message });
};

export const register = async (req, res) => {
  const { username, email, password, mobile } = req.body;

  const userexits = await Admin.findOne({ username });

  if (userexits) {
    req.flash("message", "User Already Exists");
  } else {
    const hashedpassword = await bcrypt.hash(password, 12);

    const admin = new Admin({
      username,
      email,
      password: hashedpassword,
      mobile,
    });
    try {
      await admin.save();
      req.flash("message", "successfully Registered");
    } catch (error) {
      res.redirect("/");
    }
  }
  res.redirect("back");
};

export const login = async (req, res) => {
  const { username, password } = req.body;

  const userexits = await Admin.findOne({ username });

  if (!userexits) {
    req.flash("message", "Username is Incorrect");
  } else {
    const validpassword = await bcrypt.compare(password, userexits.password);

    if (!validpassword) {
      req.flash("message", "Password is Incorrect");
    } else {
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

      return res.redirect("/admin/dashboard");
    }
  }

  res.redirect("back");
};

export const getaddbook = (req, res) => {
  const message = req.flash("message");
  res.render("admin/addbook", { message: message });
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
    req.flash("message", "Book Added successfully");
  } catch (error) {
    req.flash("message", "Sorry Something went wrong");
    return res.redirect("addbook");
  }
  res.redirect("back");
};

export const bookdetails = async (req, res) => {
  try {
    const books = await Book.find({});
    const message = req.flash("message");
    res.render("admin/bookdetails", { books: books, message: message });
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
    req.flash("message", "Book Deleted successfully");
  } catch (error) {
    req.flash("message", "Sorry Something Went Wrong");
    return res.redirect("back");
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
        req.flash("message", "Sorry Something Went wrong !");
        return res.redirect("back");
      } else {
        req.flash("message", "Book Updated Sucessfully");
        res.redirect("back");
      }
    }
  );
};

export const geteditbook = async (req, res) => {
  const book = await Book.findById(req.params.id);
  const message = req.flash("message");
  res.render("admin/editbook", { book: book, message: message });
};

export const bookdetail = async (req, res) => {
  const book = await Book.findById(req.params.id);
  res.render("admin/singlebook", { book: book });
};

export const geteditpassword = async (req, res) => {
  const message = req.flash("message");
  res.render("admin/editpassword", { message: message });
};

export const editpassword = async (req, res) => {
  const { password1, password2, password3 } = req.body;
  const user = await Admin.findOne({ username: req.user.username });
  const validpassword = await bcrypt.compare(password1, user.password);

  if (!validpassword) {
    req.flash("message", "Invalid Password");
    return res.redirect("back");
  }

  if (!(password2 === password3)) {
    req.flash("message", "Passwords Do not Match");
    return res.redirect("back");
  }

  const hashedpassword = await bcrypt.hash(password2, 12);

  try {
    await Admin.updateOne(
      { username: user.username },
      { $set: { password: hashedpassword } }
    );
    req.flash("message", "Password Updated Successfully");
    return res.redirect("back");
  } catch (error) {
    req.flash("message", "Sorry Something Went Wrong");
    return res.redirect("back");
  }
};
export const logout = (req, res) => {
  res.clearCookie("access_token");
  res.redirect("/");
};
