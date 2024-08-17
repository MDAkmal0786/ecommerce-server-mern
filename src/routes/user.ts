 import express from "express";
import { deleteUser, getAllUsers, getUser, newUser, updateUser } from "../controllers/user.js";
import { adminOnly } from "../middlewares/auth.js";

 let app = express.Router() ;

 app.post ("/new" , newUser) ; //  /api/v1/user/new
 // new user is req-res function in colntroller file 
 app.get("/all" , adminOnly , getAllUsers ) ; //  /api/v1/user/all

 app.get("/:id" , getUser) ; // particula user 
//   /api/v1/user/dynamicid

app.delete("/:id" , adminOnly , deleteUser);
app.put("/:id" , adminOnly , updateUser);

 
 export default app;