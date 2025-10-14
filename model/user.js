const mongoose = require("mongoose");
const CONST = require("../commonFunction/CONST.JS");


const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      tolowercase: true
    },
    password: {
      type: String,
      required: true,
    },
    otp:{
      type:Number
    },
    isVerified:{
        type:Boolean,
        default:false
    },
    role:{
        type:Number,
        enum:[CONST.USER, CONST.ADMIN],
        default:CONST.USER
    },
    token:{
        type:String
    },
    assistantName: {
      type: String, 
    },
  },
  { timestamps: true }
);


const User = mongoose.model("User", userSchema);
module.exports.User = User
