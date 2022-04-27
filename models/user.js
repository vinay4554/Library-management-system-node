import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    trim: true,
    required: [true, "User name required"],
    unique: true,
  },
  email: {
    type: String,
    trim: true,
    unique: true,
    required: true,
  },
  password: String,
  joined: { type: Date, default: Date.now() },
  bookIssueInfo: [
    {
      book_info: {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Issue",
        },
      },
    },
  ],
  mobile: Number,
  fines: { type: Number, default: 0 },
});

const User = mongoose.model("User", userSchema);

export default User;
