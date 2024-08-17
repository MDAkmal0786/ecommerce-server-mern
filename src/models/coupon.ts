import mongoose from "mongoose";

let schema = new mongoose.Schema({

    code:{
        type:String,
        required:[ true, "Please enter the Coupon code"],
        unique:true
    },
    amount:{
        type:Number,
        required:[ true, "Please enter the discount amount"],
    }

} 
); 




export let Coupon = mongoose.model("Coupon" , schema) ;