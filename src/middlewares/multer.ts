import multer from "multer";
// multer  a   m i d d l e w a r e   which  process file upload . .   from   f o r m   

// for a route with photo.. multer middlewrae is added ..then it  save file in upload folder
// populate in REQUEST .  . . . . .  req.file as well 


let storage = multer.diskStorage(   {  

    


    // populate the file to req.file.path and provide a disk storage for a while

    // we would upload it  cloudaniray and store url in mongoDB
 
   filename(req, file, callback) {
       
        callback(null ,file.originalname);  // filename original
   },


})

export const singleUpload= multer({storage}).single("photo") ;