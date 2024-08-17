import  express  from "express";
import { getBar, getLine, getPie, getStats } from "../controllers/stats.js";
import { adminOnly } from "../middlewares/auth.js";
let app = express.Router();

//      a d m i n    d a s h b o a r d   A P I 's

//       api/v1/dashboard/stats
app.get("/stats",adminOnly , getStats  )   ;

//       api/v1/dashboard/pie
app.get("/pie" ,adminOnly , getPie ) ;

//       api/v1/dashboard/bar
app.get("/bar" ,adminOnly , getBar ) ;

//       api/v1/dashboard/line
app.get("/line" ,adminOnly , getLine ) ; 

export default app ;