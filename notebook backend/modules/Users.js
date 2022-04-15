const mongoose=require("mongoose")

// create user Schema
const userSchema = new mongoose.Schema({
    name: { type: String,required:true },
    email: { type: String,requiered:true,unique:true},
    password: { type: String,requiered:true },
    timestamp: { type: Date,default:Date.now },
    }
  );
const User=mongoose.model('User', userSchema); // create table name which will use above schema
 module.exports = User;
