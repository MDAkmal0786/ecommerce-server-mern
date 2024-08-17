import { Request } from "express";
import { tryCatch } from "../middlewares/errors.js";
import { newOrderDataType } from "../types/types.js";
import { Order } from "../models/order.js";
import { invalidateCache, reduceStock } from "../utils/features.js";
import ErrorHandler from "../utils/util-class.js";
import { myCache } from "../app.js";

export const newOrder = tryCatch (
    async(req:Request<{} , {} , newOrderDataType> , res , next)=>{

        let{shippingInfo , user , orderItems , subTotal , tax ,  total , shippingCharges , discount} = req.body;
        
        if ( !shippingInfo|| !user || !orderItems || !subTotal || !tax || !total ){
            return next(new ErrorHandler("fill all field" , 400));
        }

      let order=  await Order.create({shippingInfo , user , orderItems , subTotal , tax ,  total , shippingCharges , discount});


      await  reduceStock ( orderItems ) ; // reduce the stock as now order of certain quantityt has been placed 


    let productIds=  orderItems.map((item)=>item._id )

     await invalidateCache ( { product:true , order:true , admin:true , productIds:productIds , userId:String(order.user) } ) ; // product part of order stock changes product cache chnges

        res.status(201).json ( { 

            success : true ,
            message : "order created" ,

        } 
    ) ;

        
    }
)

export const getMyOrders= tryCatch(

    async( req , res , next )=>{ // api/v1/order/my?id=nefc
    
        //   give    orders   of   a   user's   ID

         const {id} = req.query;  
         let orders;
         if ( myCache.has(`my-orders-${id}`) ) {

            orders= JSON.parse( myCache.get(`my-orders-${id}`)as string ) ;

         }
         else {
             orders = await Order.find({user:id});

             myCache.set(`my-orders-${id}` , JSON.stringify(orders) );
         }

         res.status(200).json({
            success :true,
            orders: orders
         })


         

    }
)

export const allOrders= tryCatch(

    async( req , res , next )=>{ // api/v1/order/all
             
         let orders;
         if ( myCache.has(`all-orders`) ){

            orders= JSON.parse( myCache.get(`all-orders`)as string ) ;

         }
         else {
             orders = await Order.find({}).populate("user" , "name") ;  // populate replace an id to its related object just like finbyid  but without any second call , wecan even select the only attributes to be populated
             myCache.set(`all-orders` , JSON.stringify(orders) ) ;
         }

         res.status(200).json ( {
            success :true,
            orders: orders
         })
    }
)

export const getSingleOrder = tryCatch ( 

    async( req , res , next ) => { // api/v1/order/:id   - - G E T  request

        let {id} = req.params;
             
         let order;
         if ( myCache.has(`orders-${id}`) ) {

            order = JSON.parse( myCache.get(`orders-${id}`)as string ) ;

         }
         else {
             order = await Order.findById(id).populate("user" , "name") ;  // populate replace an id to its related object just like finbyid  but without any second call , wecan even select the only attributes to be populated

             if ( !order){
                return next(new ErrorHandler("order not found" , 404) );
             }
             myCache.set(`orders-${id}` , JSON.stringify(order) ) ;
         }

         res.status(200).json ( {
            success :true,
            order: order
         } )
    }
)

export const processOrder = tryCatch ( 

    async( req , res , next )=>{ // api/v1/order/:id  --PUT  UPDATE request

        let {id} = req.params;
             
        
           let  order = await Order.findById(id) ;

             if ( !order) {
                return next ( new ErrorHandler("order not found" , 404) );
             }

             if ( order.status === "Processing" ) {

                order.status="Shipped";

             }
             else if (order.status==="Shipped" ) {

                order.status="Delivered";
             }

             await order.save();
             await invalidateCache ( { product:false , order:true , admin:true  , userId:String(order.user) , orderId:String(order._id)  } ) ; // when order uodates then only order value decaches
           
         res.status(200).json ( {
            success :true,
            message: "Order updated successfully"
         } )
    }
)
export const deleteOrder = tryCatch ( 

    async( req , res , next )=>{ // api/v1/order/:id  --deletee  

        let {id} = req.params;
             
        
           let  order = await Order.findById(id) ;

             if ( !order) {
                return next ( new ErrorHandler("order not found" , 404) );
             }

           await order.deleteOne();

           
           await  invalidateCache ( { product:false , order:true , admin:true , userId:String(order.user) , orderId:String(order._id) } ) ; // when order uodates then only order value decaches
           
         res.status(200).json ( {
            success :true,
            message: "Order deleted",
         } )
    }
)