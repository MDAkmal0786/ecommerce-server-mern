
import { tryCatch } from "../middlewares/errors.js";
import { Coupon } from "../models/coupon.js";
import ErrorHandler from "../utils/util-class.js";
import { stripe } from "../app.js";



export const paymentCreate = tryCatch (
                                       //  post /api/v1/payment/create
    async (req , res , next )=>{

        let {amount}=req.body;

         if ( !amount )  { 
            return next( new ErrorHandler( "Please Enter Amount" , 400 ) ) ;
         }


const paymentIntent = await stripe.paymentIntents.create({
    amount:Number(amount)*100, // money in paise      or cents in case of dollar
    currency:"inr",
})
          return res.status(201).json({
            success:true,
           clientSecret:paymentIntent.client_secret  // use by clinet side  to complete the payment from the frontend
          })
    }
)



export const newCoupon = tryCatch (

    async (req , res , next )=>{

         let {code , amount} = req.body;

         if ( !code || !amount ){
            return next(new ErrorHandler( "fill all field" , 400 ) ) ;
         }
          await Coupon.create({code , amount}) ;


          return res.status(201).json({
            success:true,
            message:`Coupon ${code} created successfully`
          })



    }
)


export const discount= tryCatch (

    async(req , res , next)=>{

        let {code} = req.query;

        let coupon = await Coupon.findOne( { code } ) ;
         
        if ( !coupon) {
            return next ( new ErrorHandler("coupon doesn't Exist" , 400) ) ;
        }

        return res.status(200).json ( {
            success:true,
            amount:coupon.amount
          }
        )
    }
)
export const allCoupon= tryCatch(
    async(req , res , next)=>{ // api/v1/payment/coupon/all

        

        let coupons = await Coupon.find({});


        return res.status(200).json({
            success:true,
            coupons,
          })

    }
)

export const deleteCoupon= tryCatch (
    async(req , res , next)=>{ // api/v1/payment/coupon/:id   dleete request

        

        let coupon = await Coupon.findById(req.params.id) ;

        if ( !coupon ) {
            return next ( new ErrorHandler ( "coupon doesn't Exist" , 400 ) );
        }

        await coupon.deleteOne() ;

        return res.status(200).json( {
            success:true,
            message:`coupon : ${coupon.code} deleted`,
          })

    }
)