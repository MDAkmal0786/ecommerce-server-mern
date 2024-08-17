import { NextFunction, Request, Response } from "express";
import { User } from "../models/user.js";
import { NewUserRequestBody } from "../types/types.js";
import ErrorHandler from "../utils/util-class.js";
import { tryCatch } from "../middlewares/errors.js";



 
 export const newUser = tryCatch ( 

    // tryCatch a function accepting req-res control funtion as argumnt and retuning a function .. then resolving like try-catch-next automaticalyy

    // u dont have to write try catch block and call next


    async (
        req:Request<{} , {} , NewUserRequestBody> ,
        res:Response ,
        next:NextFunction ) => {
    
            
            const { name , email , photo , gender ,  _id , dob } = req.body ;

          let user = await User.findById( _id ) ;  // if user just sign in with google  
          if ( user ) {
                
            return res.status(200).json (
             {  
                success : true ,
                message : `Welcome ${user.name} signed in`   
            }
         )

          }

          if (  !name || !email || !photo || !gender  || !dob || !_id  )
          {
                 return next( new ErrorHandler("fill all details" , 400) ) ;

          }

             user = await User.create ( { name , email , photo , gender ,  _id , dob: new Date(dob) } ) ;
    
           return res.status(201).json ( {  
    
                success:true,
                message:`Welcome ${user.name} you are registered`
                
            } )
    
        }
 )


 export const getAllUsers = tryCatch(
  async ( req , res , next)=>{

  let users = await User.find({}); // empty filter for all

  return res.status(200).json({
    success:true,
    users
  })

  }
 )

 export const getUser = tryCatch ( // api/v1/user/dynamicId

  async(req,res,next)=>{

    let user = await User.findById(req.params.id) ; 
    if ( !user)
    {
       return next(new ErrorHandler(`no user register with id : ${req.params.id}` , 400) )
    }

    return res.status(200).json({
      success : true ,
      user
    });

  }
 )

 export const deleteUser = tryCatch ( // api/v1/user/dynamicId

  async(req,res,next)=>{

    let user = await User.findById(req.params.id) ; 
    if ( !user)
    {
       return next(new ErrorHandler(`no user found with id : ${req.params.id}` , 400) )
    }
    await  user.deleteOne();

    return res.status(200).json({
      success : true ,
      message:"user deleted",
    });

  }
 )
 export const updateUser = tryCatch ( // api/v1/user/dynamicId  -- PUT

  async(req,res,next)=>{

    let user = await User.findById( req.params.id ) ; 
    if ( !user )
    {
       return next(new ErrorHandler(`no user found with id : ${req.params.id}` , 400) );
    }

    if ( user.role=="user"){
      user.role="admin"
    }
    else{
       user.role="user"

    }
    await  user.save();

    return res.status(200).json({
      success : true ,
      message:`user role updated to ${user.role}`,
    });

  }
 )