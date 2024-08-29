import { NextFunction, Request, Response } from "express";
import ErrorHandler from "../utils/util-class.js";

export const errorMiddleware = ( err : ErrorHandler , req:Request , res:Response , next:NextFunction ) => {  
 
    err.message     ||=  "internal server error" ;   // if err is not then internal.error 500..
    err.statusCode  ||=   500

    //   error handling middleware reusing  to catch differnt error
    //   they are midleware to which responce cylce is passed   by  next ( error ) ..to last handler after catching it
    //   hence it shouls be last

    //   err:Error   .. catched   catch(error) ..pased by   next( error )

    // and has only ( err.name    err.message)

    // to pass status we have to extend E rror class

    if (err.name==="CastError" ){  // custimization for wrong ObjectId structure

      err.message="invaild ID";
  
    }

  


    return res.status(err.statusCode).json(
      {
        success : false ,
        message : err.message,
    } 
  )

}


 //.......................T O   A V O I D  W r i t e   { t r y  c a t c h   +   n e x t }   we are make a 
 
 //  T R Y  -   C A  T C H wrapper  



  // take req,res function (controller) as argument  and return a function 
  // this return function can get (req , res) as  a handler return a chain of req , res cyle 
export const tryCatch = (func :  (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>> ) => ( req:Request , res:Response , next:NextFunction) => {



return Promise.resolve(func(req , res , next)).catch(next); // this how a try catch works .. reslove a promise and catch

}