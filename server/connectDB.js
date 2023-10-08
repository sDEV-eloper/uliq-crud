const mongoose = require('mongoose')

const connectDB=async()=>{
    try{
        await mongoose.connect("mongodb://127.0.0.1:27017/uliq");
        console.log("connected to MongoDB database")
    }
    catch(err){
        console.log(err)
    }
}

module.exports= connectDB