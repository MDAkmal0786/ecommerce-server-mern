
import  express  from "express";
import { allCoupon, deleteCoupon, discount, newCoupon, paymentCreate } from "../controllers/payment.js";
import { adminOnly } from "../middlewares/auth.js";
let app = express.Router();

// api/v1/payment/

// for creating the order ... cart --->>>> shipping adress  --> completion  of  order  after  paymnent . . .

// for paymnet.user will give amount of the order  to create STRIPE PAYMENT INTENT and get CLIENT_SECRET key (used for frontend to confirm paymant)
// when stripe (3rd party)payment is done confirmed by (  client_secret   key )   .... call order to create order

app.post  ("/create" , paymentCreate ) ; 
app.post  ("/coupon/new" , adminOnly , newCoupon ) ;
app.get   ("/discount" , discount ) ; // if coupon exist then give them the discount  code given in QUERY
app.get   ("/coupon/all" , adminOnly , allCoupon ) ;
app.delete("/coupon/:id"  , adminOnly , deleteCoupon ) ;

export default app;