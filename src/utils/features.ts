import mongoose, { Document } from "mongoose";
import { invalidateCacheDataType, orderItemType } from "../types/types.js";
import { myCache } from "../app.js";
import { Product } from "../models/product.js";
import ErrorHandler from "./util-class.js";
import { User } from "../models/user.js";
import { Order } from "../models/order.js";

export let connectDB = (uri:string)=>{
    mongoose.connect(  uri ,
          {
        dbName:"Ecommerce_24",  // with this name 
    }).then((c)=>console.log(`DB Connected to ${c.connection.host}`)).catch((e)=>console.log(e) );
}// console when connnected


export const invalidateCache = async ( {product ,order , admin ,productIds ,userId , orderId}:invalidateCacheDataType )=>{  

    // helps us to    D E C A C H E values of certain type
   //  eg.  if somethong has deleted or updated  , added  in PRODUCT then delete cached values to avoid anamoly

    if ( product )
    {
        let productKey:string[] = [ "latest-product" , "category-product" , "all-product"   ] ;

    

       productIds&&productIds.forEach(id => {//produuctids are array of productid given when order is created for multiple product and there stock are c h a n g e d

        productKey.push(`product-${id}`);
        
       });


        myCache.del(productKey) ;    ///   delete array of keys  c a c h e d       
    }

    if ( order )
    {
        let orderKey:string[]  =  ["all-orders" ,`my-orders-${userId}` , `orders-${orderId}`] ;

        //  my-orders-${id}  --  some order dleted  , created  , processed then that user speecific `my-order-id` should be  D E C A C H E D


 
        //  orders-${id}   -- order updated  , deleted then that order id specific order-id would be decached 

        myCache.del( orderKey ) ;

    }

    if ( admin ) 
    {
        myCache.del( [ "admin-stats" , "admin-pie-charts" ,"admin-bar-charts" , "admin-line-charts" ] )
       
    }



}

export const reduceStock =async ( orderItems:orderItemType[] ) =>{

    // decrease the quantity from stock as that many quantity of products the order has been place

    for ( let i=0; i < orderItems.length;  i++ ) {

        let quantity=orderItems[i].quantity;

        let product = await Product.findById(orderItems[i]._id ) ;
        if  ( !product){
            return new ErrorHandler ( "not found product" , 404 ) ;
        }

        product.stock -= quantity;
       await product.save();
        

    }

}

export function CalculateChangePercent(thisMonth:number , lastMonth:number){

    if (lastMonth==0){
        return thisMonth*100;
    }

    let ans= (thisMonth/lastMonth)*100;  // absolute %    lastMOnth itslef =100%   eg  (  2 --> 8 == 400%   )
    return Number(ans.toFixed(0));

}

interface myDocument extends Document { // Document do not have timestamp
    createdAt : Date ,
}

interface mapLastMonthsDataType{
length:number,
documentArr:myDocument[]
}

export function mapLastMonthsData(  { length , documentArr }:mapLastMonthsDataType){

    let currentDate=new Date();

    let data:number[]=new Array(length).fill(0) ;

    documentArr.forEach((document)=>{

      let month=  document.createdAt.getMonth() ;

      let differMonth= (currentDate.getMonth()-month+12)%12; // +12 for cross year difrenece 
      

      data[length-1-differMonth]++;

    })

    return data;
    
}