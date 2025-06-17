import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    nom:{type : String, required: false},
    prenom:{type: String, required: false},
    email:{type: String, required: true},
    tel:{type: String, required: false},
    password:{type:String, required:true}
})
const User= mongoose.model('User',userSchema)
export  default User;