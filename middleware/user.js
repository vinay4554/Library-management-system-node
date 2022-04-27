import User from "../models/user.js";
import Book from "../models/book.js";
import Issue from "../models/issue.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

export const getlogin = (req, res) => {
  if (req.user) {
    res.redirect("dashboard");
  } else {
    res.render("user/userlogin");
  }
};

export const getregister = (req, res) => {
  res.render("user/userregister");
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
    res.render("user/userlogin");
  } catch (error) {
    res.redirect("/");
  }
};

export const login = async (req, res) => {
  const { username, password } = req.body;

  const userexits = await User.findOne({ username });

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
    res.render("user/issuebook", { books: books });
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

        res.redirect("back");
      } else {
        res.send("You Already Took The book Return It");
      }
    } else {
      res.send("Return Previous Books to issue");
    }
  } catch (err) {
    console.log(err);
    return res.redirect("back");
  }
};

export const getreturnbook = async (req, res) => {
  try {
    const booksdata = await Issue.find({
      "user_id.username": req.user.username,
    });
    res.render("user/returnbook", { books: booksdata });
  } catch (err) {
    console.log(err);
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

    res.redirect("back");
  } catch (err) {
    console.log(err);
    return res.redirect("back");
  }
};

export const profile = async (req, res) => {
  try {
    const profile = await User.findOne({ username: req.user.username });
    res.render("user/profile", { profile: profile });
  } catch (err) {
    console.log(err);
  }
};
