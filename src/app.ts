import express from "express";
import productRoute from "./routes/products.js"
import userRoute from "./routes/user.js"
import orderRoute from "./routes/orders.js"
import paymentRoute from "./routes/payment.js"
import statsRoute from "./routes/stats.js"
import { connectDB } from "./utils/features.js";
import { errorMiddleware } from "./middlewares/errors.js";
import NodeCache from "node-cache"
import { config } from "dotenv";
import morgan from 'morgan'
import Stripe from "stripe";
import cors from "cors"


config({  // connnecting env file   whatever varibale are not static rather from  E N V   file
    path:"./.env"

})

let stripeKey = process.env.STRIPE_KEY!    // apikey of account

export const stripe = new Stripe(stripeKey);   // stripe payment configuration


export  const myCache = new  NodeCache(); // caching


  


let uri  = process.env.MONGO_URI;

connectDB(uri!) ; // connect to string and crate Ecommerce_24 database instance

const port=    Number(process.env.PORT) || 4002  



const app = express() ;
app.use( express.json() ) ; // for body json
app.use(morgan("dev"));  // morgan just give infornaition in terminal @bout the http req made
app.use(cors()); // alloow all url cross origin


//routing at backend
app.use("/api/v1/user" , userRoute);// any thing related to "/user"  goes to route user
app.use("/api/v1/product" , productRoute);
app.use("/api/v1/order" , orderRoute);
app.use("/api/v1/payment"   , paymentRoute);
app.use("/api/v1/dashboard"   , statsRoute);


  

 app.use("/uploads" , express.static("uploads"));  // to allow upload folder to be static so that we can access it by going to its directory (rather treating it as an API/route) eg.  localhost:3001/uploads/cover.png 

app.use(errorMiddleware) ; //error handlingmiddleware  works in last for every route guided by next( error)

app.listen( port , ()=>{
    console.log(`server is working on http://localhost:${port}` )
} )









// the ts code is comverted in production build to js  
// for that run tsc.cmd -w  to convertauto matic
// and run js file  node dist/app.js
// we have added them in  scripts so run   .. npm run dev   .......and npm run watch   simultnosly in 2terminal