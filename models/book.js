import mongoose from "mongoose";

const bookSchema = new mongoose.Schema({
  title: String,
  ISBN: String,
  stock: Number,
  author: String,
  category: String,
  description: String,
  imageurl: {
    type: String,
    default:
      "https://www.adazing.com/wp-content/uploads/2019/02/open-book-clipart-03.png",
  },
});

const Book = mongoose.model("Book", bookSchema);

export default Book;
