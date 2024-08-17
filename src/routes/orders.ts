
import express from 'express'
import { allOrders, deleteOrder, getMyOrders, getSingleOrder, newOrder, processOrder } from '../controllers/order.js';
import { adminOnly } from '../middlewares/auth.js';

let app = express.Router( ) ;

app.post("/new" , newOrder ) ; //    api/v1/order/new
app.get ("/my" , getMyOrders ) ;
app.get ("/all" , adminOnly , allOrders ) ;
app.get ("/:id" , getSingleOrder ) ;
app.put ("/:id" , adminOnly , processOrder ) ;
app.delete("/:id" , adminOnly , deleteOrder ) ;

export default app ;