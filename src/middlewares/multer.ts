import multer from "multer";
import { v4  } from "uuid"; 

// multer  a   m i d d l e w a r e   which  process file upload . .   from   f o r m   

// for a route with photo.. multer middlewrae is added ..then it  save file in upload folder
// populate in REQUEST .  . . . . .  req.file as well 


let storage = multer.diskStorage({  // permanent storge
    // options

   destination(req, file, callback) {
       callback(null , "uploads");  // folder
   },

   filename(req, file, callback) {

    // fielname should not be file.originalNmae as with tha same name we can multiple file so add custom names

    // uuid is random ID generator package -- v4 method
    let id = v4(); 


    // cover.akmal.png 
    let extVaribale = file.originalname.split(".").pop();  // spilt with dot and get EXTENSION(remember there can multiple dots so POP() for last part)
    
        callback(null ,`${id}.${extVaribale}` );  // filename original
   },


})

export const singleUpload= multer({storage}).single("photo") ;