import validator from "validator"
import mongoose from "mongoose";

interface UserType extends Document{
    _id:string;
    name:string;
    email:string;
    photo:string;
    role : "admin" | "user";
    gender : "male" | "female";
    dob :Date;
//virtual attribute created on base 
    age:number;

    //timestamp user info

    createdAt:Date;
    updateAt:Date;


}


const schema = new mongoose.Schema( {

    _id : {  // own custom id (from firebase) not mongodb one 
        type:String,
        required:[true , "Please Enter ID"]
    } ,
    name : {
        type:String,
        required:[true , "Please Enter Name"]
    },
    email : {
        type:String,
        required:[true , "Please add Email"],
        unique:[true ,"Email already Exist" ],

        validate:validator.default.isEmail, // use npm i validator package to validate email
    },

    photo : {
        type : String ,
        required : [true , "Please add Photo"] ,
    } ,

    role : {
        type : String ,
        enum : ["admin" , "user"] , //Enum : possible  fieled value
        default : "user"
    } ,

    gender : {
        type:String,
       enum:["male" , "female"], //Enum :  
       required:[true , "Please add Gender"]
       
    }, 
    dob :{
        type:Date,
       //Enum :  
       required:[true , "Please add DOB"]
       
    },

} , {
    timestamps:true,
}) ;

schema.virtual("age").get(function()
{//virtual schema add. virtual attribute eg. age part of echema from dob calculation
    let today = new Date();
    let dob   = this.dob;
    let age   = today.getFullYear()-dob.getFullYear();

    if ( today.getMonth() < dob.getMonth() || today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate() )
    {
        age--;
    }

    return age;
    
} ) ; 

export const User = mongoose.model<UserType>("User" , schema ) ;
