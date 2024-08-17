import mongoose from "mongoose";


const schema = new mongoose.Schema ( {
   

    // ORDER SCHEMA overview   - 
    // order will have user id who took order  + 
    // his Shipping Adress  +
    // and product details  { array of products and quantitty } +
    // and toal price details as we do everything at backnneed  and map values at frontend

    shippingInfo:{

        adress : {
            type:String,
            required:true,
        },
        city:{
            type:String,
            required:true
        },
        state:{
            type:String,
            required:true
        },
        country:{
            type:String,
            required:true
        },
        pinCode:{
            type:Number,
            required:true
        },
    },

    user:{ 
         type : String ,  // user _id is custom from firebse so STRING otherwise mongoose.Types.ObjectId
         ref : "User",     // refernece  of   _id 's   M O D E L  
        required : true 
    }
    ,
    subTotal : {
        type : Number,
        required : true,
    },
    tax:{
        type:Number,
        required:true,

    },
    shippingCharges:{
        type:Number,
        default:0

    },
    discount:{
        type:Number,
        default:0
    },

    total:{
        type:Number,
        required:true,

    },

    status : {
        type:String,
       enum:["Processing" , "Shipped" , "Delivered"],
       default:"Processing",
    },

    orderItems:[
   {
    _id:{
        type : mongoose.Types.ObjectId,
        ref : "Product",
    },
    name:String,
    photo:String,
    price:Number,
    quantity:Number,
    stock:Number
    
        
    }
]



} 
,

{
  
    timestamps : true ,
}
) ;
export const Order = mongoose.model(  "Order"  , schema ) ;