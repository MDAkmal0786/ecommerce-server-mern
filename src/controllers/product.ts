import { NextFunction, Request, Response } from "express";
import { tryCatch } from "../middlewares/errors.js";
import { Product } from "../models/product.js";
import { filterdataType, FilterDataTypeForQuery, NewProductRequestBody } from "../types/types.js";
import ErrorHandler from "../utils/util-class.js";
import { rm } from "fs";
//import {faker} from "@faker-js/faker"
import { myCache } from "../app.js";
import { invalidateCache } from "../utils/features.js";
import  cloudinary  from "../utils/cloudinary.js";

export const newProduct = tryCatch(
    async(req:Request<{},{},NewProductRequestBody>,res:Response , next:NextFunction)=>{

        
// real file from form-body will be populated in request (req.file) by multer

          
           
          let {name , price , category , stock } = req.body ;    //    F O R M    DATA AS BODY for multer pick image and process 

          const photo = req.file;   // populated photo through multer
          

          if (  !name || !price || !category || !stock || !photo ) {

            return next( new ErrorHandler("please add all feilds" , 400 ) ) ;
          }


     // add phot to cloudaniry
   

     const uploadResult = await cloudinary.uploader.upload(
           photo.path
       )
       .catch((error) => {
        console.log(error.message);
        return next( new ErrorHandler("cloudinary upload issue" , 400 ) )
       });








          let product = await Product.create ( {
               name ,
               price  ,
               stock ,
               category:category.toLowerCase() ,
                photo:uploadResult?.url,
            });  // mongo store string  so store the path eg. uploads/cover.png

           await  invalidateCache( { product:true, admin:true}  ) ;

          res.status(201).json({

            success:true,
            message:"product created successfully"

          })
    }
)


export const latestProduct = tryCatch(

   async ( req , res , next ) => {

    let products;

      // my cache is node Cache which cache particular data   in JSON format  ... for a particular time  as new configuration updates as new data creates , changes
      // so we delete cacheed item when things change { at new delete updated    }


        if ( myCache.has("latest-product") ) {                   
          products = JSON.parse(myCache.get("latest-product") as string );

        }
        else{
   
           products = await Product.find({}).sort({createdAt:-1}).limit(5); 
           myCache.set("latest-product" , JSON.stringify(products) ) ;


        }

       

      res.status(200).json ( {

        success:true,
        products

      } ) ;
   }

)

export const allProductCategories = tryCatch (

  async ( req , res , next ) => {

// al products unique categories


    //  let products  = await Product.find({},{category:1 , _id:0});
    // let arr=new Array();
    // products.forEach((value)=>{
    //    arr.push(value.category);
    // })
    // let distinctProducts = new Set(arr);
    // arr=Array.from(distinctProducts)   -->> SET TO ARAY

    let categories;
    if ( myCache.has("category-product") ) {                   
      categories = JSON.parse(myCache.get("category-product") as string ) ;

    }
    else{

      categories = await Product.distinct("category") ;  
       myCache.set("category-product" , JSON.stringify(categories) ) ;


    }

     res.status(200).json ( {

       success:true,
       categories,

     } ) ;
  }

)

export const getAdminProducts = tryCatch(

  async(req , res , next)=>{

    let products;

    if ( myCache.has("all-product") ) {                   
      products = JSON.parse(myCache.get("all-product") as string );

    }
    else{

      products = await Product.find({});
       myCache.set("all-product" , JSON.stringify(products) ) ;

    }

     res.status(200).json ( {

       success:true,
       products

     } ) ;
  }

)

export const getAProduct = tryCatch (

  async(req , res , next)=>{

    // apii/v1/product/:id


    // CACHING in dynamic id has to be differnt in  names
    let{id} = req.params

    let product;

    if ( myCache.has ( `product-${id}`) ) {                   
      product = JSON.parse(myCache.get ( `product-${id}`) as string ) ;

    }
    else {

      product = await Product.findById ( id ) ;

      if ( !product ) {
 
          return next ( new ErrorHandler("product not found" , 404 ) ) ;
 
      }

       myCache.set( `product-${id}` , JSON.stringify(product) ) ;

    }

     res.status(200).json ( {

       success:true ,
       product

     } ) ;
  }
)
export const updateProduct = tryCatch(

  async(req , res , next)=>{

    //  U P D A T E  :    F I N D ....  C H A N G E .....  S A V E

     let product = await Product.findById ( req.params.id ) ;
     if ( !product ) {
      return next ( new ErrorHandler ( "product not found" , 404 ) ) ;
  }

     let { name , price  , category , stock } = req.body;
     let photo=req.file;
     if ( photo ) {


      let a = product.photo.split('/').pop() ;
      let public_id=a?.split('.')[0];
     
  
     try {
      const result = await cloudinary.uploader.destroy(public_id!) ;
     
    } catch (error) {
      console.error(error);
      return next( new ErrorHandler("cloudinary dlete issue" , 400 ) )
    }
      


      //dlete prev url form cloudaniry



      
      const uploadResult = await cloudinary.uploader.upload(
        photo.path
    )
    .catch((error) => {
     console.log(error.message);
     return next( new ErrorHandler("cloudinary upload issue" , 400 ) )
    });

      product.photo=uploadResult?.url! ;    // change mongodb photo instance 

     }
     if ( name )product.name=name ;
     if ( price )product.price=price ;
     if ( category )product.category=category ;
     if(stock) product.stock=stock ;


     await product.save( ) ;

     await invalidateCache ( { product:true , productIds: [String(product._id )] , admin:true} ) ;
       




     res.status(200).json ( {

       success:true,
       message:"product Updated successfully"

     } ) ;
  }

)

export const deletedProduct = tryCatch (

  async(req , res , next) => {

    // apii/v1/product/:id  //delete


     let product = await Product.findById( req.params.id ) ;

     if ( !product ) {
         return next( new ErrorHandler( "product not found" , 404 ) ) ;
     }


      //delete cloudanry hosted image by public key from url


      let a = product.photo.split('/').pop() ;
      let public_id=a?.split('.')[0];
  
     try {
      const result = await cloudinary.uploader.destroy(public_id!) ;
     
    } catch (error) {
      console.error(error);
      return next( new ErrorHandler("cloudinary dlete issue" , 400 ) )
    }





     await product.deleteOne();


     await invalidateCache( { product:true , productIds:[String(product._id )], admin:true} ) ;
     

     res.status(200).json ( {

       success:true,
         message:"product deleted successfully"

     } ) ;
  }

)

export const searchProduct = tryCatch (

  async(req:Request<{},{} , {} , FilterDataTypeForQuery> , res , next)=>{  // query need type in Request


    //   api / v1 / product / search  
    
    //     F   I   L   T   E    R

    // on the basis of  filter  //  name // price  // category // sort ( asc / desc ) 


    // api/v1/product/search ? name=whey & price=1500 & category=fitness & sort=des       --->> query parameteer


    let { name , price , category , sort } = req.query ;

    let page = Number(req.query.page)  ;
    let limit = 8    //process.env.PRODUCT_PER_PAGE||8 ;  //dont make static varibale so that u can later change env file later
    let skipProducts = (page-1)*limit; // skip page-1 and take next <=8




    let query:filterdataType = {} ;// make query conditionaly add key accordingly if they are passed 

    if ( name ) { 
      query.name={     //  name  as   p a t t e r n    .. case Insensitive
      $regex:name ,
      $options:"i",    
     }
    };
    if ( price ) {
      query.price={
        $lte:Number(price) 
      }

    }
    if ( category)
    {
      query.category=category 
    }

   let [pagedproducts , totalProducts]  = await Promise.all([// promise .all run all promise items  in arr paralelly and retun array of result

      Product.find ( query ).
    sort( sort&&{ price:( sort==="asc") ? 1 : -1 } ).// sort if there other sort() doesnt work
    skip(skipProducts).limit( limit ) // filterd pages products 
    ,
     Product.find ( query )// for finding all products
   ]) ; 

   let totalPages=Math.ceil(totalProducts.length/limit ) ;

   
     res.status(200).json ( {

       success:true,
       pagedproducts,
       totalPages

     } ) ;
  }

);

// const addSomeFakeData = async(count:number=10)=>{

//   let productArr=[];// arr of product

//   for ( let i=0; i<count; i++)
//   {
//       let product={
//         name:faker.commerce.productName(),
//         photo:"uploads\\e7f51ffc-916e-4369-945a-e2ec0da90290.JPG",
//         price:faker.commerce.price({min:1500 , max:90000}),
//         stock:faker.commerce.price({min:0 , max:100}),
//         category:faker.commerce.department(),
//         createdAt: new Date(faker.date.past()),
//         updatedAt: new Date(faker.date.recent()),
//         _v:0,
//       }
//       productArr.push(product);
      
//   }


//   await Product.create(productArr) ;

// }

 //addSomeFakeData(40);




//  let deleteSomeFakeData= async(count:number)=>{

//     let products = await Product.find({}).skip(3).limit(count);

//     products.forEach( async element => {

//       await element.deleteOne();


      
//     });

//  }
//  deleteSomeFakeData(40);


