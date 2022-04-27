import express from "express";
import bodyparser from "body-parser";
import dotenv from "dotenv";
import mongoose from "mongoose";
import flash from "connect-flash";
import session from "express-session";
import cookieParser from "cookie-parser";
dotenv.config();
// importing routes

import adminroutes from "./routes/admin.js";
import userroutes from "./routes/user.js";

const app = express();
app.use(express.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser("myselfvinaykumar"));
app.use(
  session({
    secret: "myselfvinaykumar",
    cookie: { maxAge: 60000 },
    resave: true,
    saveUninitialized: true,
  })
);
app.use(flash());
import Book from "./models/book.js";

app.set("view engine", "ejs");

// calling the middlewares

app.get("/", async (req, res) => {
  try {
    const books = await Book.find({});
    res.render("home", { books: books });
  } catch (error) {
    console.log(error);
  }
});

app.post("/search", async (req, res) => {
  const { value } = req.body;
  try {
    const books = await Book.find({
      $or: [
        { title: { $regex: value } },
        { author: { $regex: value } },
        { category: { $regex: value } },
      ],
    });
    res.render("home", { books: books });
  } catch (error) {
    console.log(error);
  }
});

app.get("/search", (req, res) => {
  res.redirect("back");
});
app.use("/admin", adminroutes);
app.use("/user", userroutes);

app.get("*", function (req, res) {
  res.render("pagenotfound");
});

mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => console.log("Data Base connected"))
  .catch((err) => console.log(err));

app.listen(process.env.PORT || 3000, () => {
  console.log("Server started");
});
