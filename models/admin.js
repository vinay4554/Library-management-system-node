import mongoose from "mongoose";
const adminSchema = new mongoose.Schema({
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
  mobile: Number,
});

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;
