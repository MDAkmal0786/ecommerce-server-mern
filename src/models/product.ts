import mongoose from "mongoose";

const schema = new mongoose.Schema({
    name:{
        type:String,
        required:[true , "please add name"]
    },
    photo:{
        type:String,
        required:[true , "please enter photo"]
    },
    price:{
        type:Number,
        required:[true , "please enter price"]
    },
    category:{
        type:String,
        required:[true , "please enter category"],
        trim:true,
    },
    stock:{
        type:Number,
        required:[true , "please enter stock"]
    }
},{
    timestamps : true ,
}
);
export const Product = mongoose.model(  "Product"  , schema ) ;