import express from "express";
import {  allProductCategories, deletedProduct, getAdminProducts, getAProduct, latestProduct, newProduct, searchProduct, updateProduct  } from "../controllers/product.js";
import {  singleUpload } from "../middlewares/multer.js";
import { adminOnly } from "../middlewares/auth.js";

let app = express.Router() ;

app.post( "/new"  , adminOnly , singleUpload , newProduct ) // api/v1/product/new   
 //. multer for file process 
// file will be populated  in req.file

app.get(  "/search" , searchProduct ) ;  // search with filter

app.get ( "/latest" , latestProduct ) ; // latest 5

app.get ( "/categories" , allProductCategories ) ;

app.get ( "/admin-products" ,adminOnly , getAdminProducts )  ;

app.get ( "/:id" , getAProduct ) ;
app.put (  "/:id" , adminOnly , singleUpload , updateProduct ) ;
app.delete (  "/:id" , adminOnly , deletedProduct ) ;





export default app;