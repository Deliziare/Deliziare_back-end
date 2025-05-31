import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    phone: Number,

    profileImage: String,

    role: {
      type: String,
      enum: ["host", "chef", "admin", "deliveryBoy"],
      required: true,
    },
    isBlock: { type: Boolean, default: false },

    isGoogleUser: { type: Boolean, default: false },

    isProfileCompleted: {
      type: Boolean,
      default: false,
    },
    savedPost:[
      {
        type:mongoose.Schema.Types.ObjectId,ref:'ChefPost'
      }
    ]
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
