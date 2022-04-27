import User from "../models/user.js";
import Book from "../models/book.js";
import Issue from "../models/issue.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import flash from "connect-flash";

export const getlogin = (req, res) => {
  if (req.user) {
    res.redirect("dashboard");
  } else {
    const message = req.flash("message");
    res.render("user/userlogin", { message: message });
  }
};

export const getregister = (req, res) => {
  const message = req.flash("sucess");
  res.render("user/userregister", { message });
};

export const dashboard = (req, res) => {
  res.render("user/dashboard", { userdata: req.user });
};

export const register = async (req, res) => {
  const { username, email, password, mobile } = req.body;

  const hashedpassword = await bcrypt.hash(password, 12);

  const user = new User({
    username,
    email,
    password: hashedpassword,
    mobile,
  });
  try {
    await user.save();
    req.flash("sucess", "Registration Sucessfull");
    res.redirect("register");
  } catch (error) {
    res.redirect("/");
  }
};

export const login = async (req, res) => {
  const { username, password } = req.body;

  const userexits = await User.findOne({ username });

  if (!userexits) {
    req.flash("message", "Username is Incorrect");
    return res.redirect("back");
  }

  const validpassword = await bcrypt.compare(password, userexits.password);

  if (!validpassword) {
    req.flash("message", "Password is Incorrect");
    return res.redirect("back");
  }

  // creating a token

  const token = jwt.sign(
    {
      id: userexits._id,
      username: userexits.username,
    },
    process.env.SECRET
  );

  // Setting jwt token in cookie as 'access_token'
  res.cookie("useraccess_token", token, {
    maxAge: 86400000,
    httpOnly: true,
  });

  res.redirect("/user/dashboard");
};

export const logout = (req, res) => {
  res.clearCookie("useraccess_token");
  res.redirect("/");
};

export const getissuebook = async (req, res) => {
  try {
    const books = await Book.find({});
    const message = req.flash("message");
    res.render("user/issuebook", { books: books, message: message });
  } catch (error) {
    res.redirect("back");
  }
};

export const issuebook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.bookid);
    const user = await User.findOne({ username: req.user.username });
    if (user.bookIssueInfo.length <= 5) {
      const bookfound = user.bookIssueInfo.filter((info) =>
        info._id.equals(mongoose.Types.ObjectId(book._id))
      );
      if (bookfound.length < 1) {
        book.stock -= 1;
        const issue = new Issue({
          book_info: {
            id: book._id,
            title: book.title,
            author: book.author,
            ISBN: book.ISBN,
            category: book.category,
            stock: book.stock,
          },
          user_id: {
            id: user._id,
            username: user.username,
          },
        });

        // putting issue record on individual user document
        user.bookIssueInfo.push(book._id);

        await issue.save();
        await user.save();
        await book.save();

        req.flash("message", "Book Successfully issued");
      } else {
        req.flash("message", "Book Already Issued");
      }
    } else {
      req.flash("message", "Return Issued Books");
    }
  } catch (err) {
    return res.redirect("back");
  }
  res.redirect("back");
};

export const getreturnbook = async (req, res) => {
  try {
    const booksdata = await Issue.find({
      "user_id.username": req.user.username,
    });
    const message = req.flash("message");
    res.render("user/returnbook", { books: booksdata, message: message });
  } catch (err) {
    return res.redirect("back");
  }
};

export const returnbook = async (req, res) => {
  try {
    const book_id = req.params.id;
    const userinfo = await User.findOne({ username: req.user.username });
    const pos = userinfo.bookIssueInfo.indexOf(req.params.bookid);

    // fetching book from db and increament
    const book = await Book.findById(book_id);
    book.stock += 1;
    await book.save();

    // removing issue
    const issue = await Issue.findOne({ "user_id.id": userinfo._id });
    await issue.remove();

    // popping book issue info from user
    userinfo.bookIssueInfo.splice(pos, 1);
    await userinfo.save();

    req.flash("message", "Book successfully returned");
    res.redirect("back");
  } catch (err) {
    req.flash("message", "Book returned Failed");
    return res.redirect("back");
  }
};

export const geteditpassword = async (req, res) => {
  const message = req.flash("message");
  res.render("user/editpassword", { message: message });
};

export const editpassword = async (req, res) => {
  const { password1, password2, password3 } = req.body;
  const user = await User.findOne({ username: req.user.username });
  const validpassword = await bcrypt.compare(password1, user.password);

  if (!validpassword) {
    req.flash("message", "Password is Incorrect");
  }

  if (!(password2 === password3)) {
    req.flash("message", "Passwords Did not match");
  }

  const hashedpassword = await bcrypt.hash(password2, 12);

  try {
    await User.updateOne(
      { username: user.username },
      { $set: { password: hashedpassword } }
    );
    req.flash("message", "Password Updated successfully");
  } catch (error) {
    req.flash("message", "Sorry Something Went Wrong");
    res.redirect("back");
  }

  res.redirect("back");
};

export const profile = async (req, res) => {
  try {
    const profile = await User.findOne({ username: req.user.username });
    res.render("user/profile", { profile: profile });
  } catch (err) {
    console.log(err);
  }
};
