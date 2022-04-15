const mongoose = require('mongoose');
mongoURI="mongodb://localhost:27017/notebook?readPreference=primary&appname=MongoDB%20Compass&ssl=false"


const connectToMongoDB=()=>{
    mongoose.connect(mongoURI, ()=>{
        console.log("connected to mongoDB successfully")
    })
}
module.exports =connectToMongoDB
