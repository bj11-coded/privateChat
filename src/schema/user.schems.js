import mongoose from "mongoose";

let profilePicture =[
    "https://i.pinimg.com/1200x/e0/8a/b6/e08ab6833ad182a9fc7f26bc11cd8921.jpg",
    "https://i.pinimg.com/736x/99/3a/53/993a53a25bb6733c99f5f57106065019.jpg",
    "https://i.pinimg.com/1200x/9a/58/90/9a5890424f91f737b395417b7eb6ef9c.jpg",
    "https://i.pinimg.com/736x/7b/5f/8e/7b5f8ed9099f56185933e42549ef1115.jpg",
    "https://i.pinimg.com/1200x/0e/71/c3/0e71c36795c37f092c6a1716b6e263a4.jpg"
]

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
    },
    profilePicture:{
        type:String,
        default:profilePicture[Math.floor(Math.random(profilePicture.length) * 5)],
    }
},{timestamps:true})

const User = mongoose.model("User",userSchema)

export default User
