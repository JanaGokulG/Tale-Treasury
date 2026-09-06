import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
    type: String,
    default: "",
   },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    avatar: {
      type: String,       // Cloudinary URL
      default: null,
    },
    avatarPublicId: {
      type: String,       // Cloudinary public_id — needed to delete/overwrite old image
      default: null,
    },
  loginHistory: [
      {
        date: {
          type: Date,
          required: true,
        },
      },
    ],
    currentStreak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
  },
 
  { timestamps: true }
);

userSchema.index({ "loginHistory.date": 1 });

export default mongoose.model("User", userSchema);