// a auth middleware

import { NextFunction, Request, Response } from "express";
import { tryCatch } from "./errors.js";
import ErrorHandler from "../utils/util-class.js";
import { User } from "../models/user.js";

// make sure  L O G G E D  in and role is  A D M I N 
  export const adminOnly = tryCatch(
    async (req:Request,res:Response,next:NextFunction)=>{

      // logeed in means he would have appended id

        let {id} = req.query // api/v1/user/all/?id=kewkncn /  a p p e n d e d

        if ( !id ) {

          return next( new ErrorHandler( "not logged in "  , 401 ) ) ;
          
        }
        let user = await User.findById( id ) ;

        if (!user) {
            
          return next( new ErrorHandler( "wrong id "  , 401 ) ) ;

        }
        if (user.role!= "admin")
        {
          return next( new ErrorHandler( "not admin"  , 403 ) ) ;  //   F O R B I D D E N
        }

         next() ;
        

         
    }
  )