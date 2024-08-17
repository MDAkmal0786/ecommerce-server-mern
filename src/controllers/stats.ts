import { myCache } from "../app.js";
import { tryCatch } from "../middlewares/errors.js";
import { Order } from "../models/order.js";
import { Product } from "../models/product.js";
import { User } from "../models/user.js";
import { CalculateChangePercent, mapLastMonthsData } from "../utils/features.js";

export const getStats = tryCatch (    // api/v1/dashboard/stats   stats gives
    async(req , res , next)=>{       // count --> of user ,  products  , orders{transaction} , and revenue
                                    //  percent --> increase in no of {user | products | orders | revenue } from prev month
                                    //  past 6 mont h revenue and orders
                                    // categories and there percent of total
                                    // top 4 latest orders
        let stats;
        let key="admin-stats" ;

        if ( myCache.has(key) ) {
            stats = JSON.parse( myCache.get(key)as string ) ;
        }
        else{

            let currentDate = new Date( ) ;
            let thisMonthStart = new Date( currentDate.getFullYear() , currentDate.getMonth() , 1 ) ;
            let lastMonthStart = new Date( currentDate.getFullYear() , currentDate.getMonth()-1 , 1 ) ;
            let lastMonthEnd = new Date  ( currentDate.getFullYear() , currentDate.getMonth() , 0 ) ;

            let sixMonthStartDate= new Date ( currentDate.getFullYear() , currentDate.getMonth()-5 , 1 ) ;//inclusive of thiscurrent month past6month=-5


            let [ productCount , orders , userCount , thisMonthProducts , lastMonthProducts , thisMonthUsers , lastMonthUsers , thisMonthOrders , lastMonthOrders , lastSixMonthOrders , uniqueCategories , userMaleCount , topFourOrders ] = await Promise.all ( [  // multiple queries we nned so put them in promise all  and awit them at once
               
                // count
                Product.countDocuments() ,
                Order.find({}).select("total") , // sleect only total as we need only orders count and revenue for each order
                User.countDocuments() ,


                // percent change queries
                Product.find({createdAt:{$gte:thisMonthStart ,   $lte:currentDate}} ), // using timestamp to find month specific
                Product.find({createdAt:{$gte:lastMonthStart ,   $lte:lastMonthEnd}} ),

                User.find({createdAt:{$gte:thisMonthStart ,   $lte:currentDate}} )  ,
                User.find({createdAt:{$gte:lastMonthStart ,   $lte:lastMonthEnd}}),

                Order.find({createdAt:{$gte:thisMonthStart ,   $lte:currentDate}}),
                Order.find({createdAt:{$gte:lastMonthStart ,   $lte:lastMonthEnd}}),

                // past 6 month orders
                Order.find({createdAt:{$gte:sixMonthStartDate }}),

                //distinct categories
                Product.distinct("category"),

                //userMale count
                User.countDocuments({gender:"male"}) ,

                // top 4 orders
                Order.find({}).sort({createdAt:-1}).select(["orderItems" , "discount" , "total" , "status"]).limit(4) // select multiple in array  remember   we get _id default

            ]);

            
            let revenue = orders.reduce((total , order)=> total+order.total, 0);   
          const count={
            revenue:revenue,
            product:productCount,
            transaction:orders.length,
            user:userCount
          }

         let thisMonthRevenue=thisMonthOrders.reduce((total , order)=> total+order.total, 0);  
         let lastMonthRevenue=lastMonthOrders.reduce((total , order)=> total+order.total, 0);  

          let percentChange={
            revenue:CalculateChangePercent(thisMonthRevenue , lastMonthRevenue),
            product:CalculateChangePercent(thisMonthProducts.length , lastMonthProducts.length),
            transaction:CalculateChangePercent(thisMonthOrders.length , lastMonthOrders.length),
            user:CalculateChangePercent(thisMonthUsers.length , lastMonthUsers.length),
          }

          // past 6month data

          let SixMonthOrders   = new Array(6).fill(0) ;
          let SixMonthRevenue  = new Array(6).fill(0) ;

          // from past 6 month order data fill  , map , individual 6 month data

          lastSixMonthOrders.forEach( (order )=> {

            let orderMonth = order.createdAt.getMonth();

              // from current month how much far is a month
            let differMonth = ( currentDate.getMonth() - orderMonth + 12 ) % 12; //  +12 becz the month could be in diff years so differnce gose negative
                                                                                 // %12 to not get >= 12

            SixMonthOrders[6-differMonth-1]++;
            SixMonthRevenue[6-differMonth-1] +=order.total;
          })

          //category and there percent out of total products
     let categoryProductCountPromise =   uniqueCategories.map( (category)=>Product.countDocuments( {category} ) ) ; //map of query to get --> arr of promisees

      let categoryProductCount = await Promise.all(categoryProductCountPromise); // arr of count of each category

      let categoryCount:Record<string,number>[]=[];

      uniqueCategories.forEach( ( category , index )=>{

                 let count = categoryProductCount[index];
                 let percentOfTotal= Math.round((count/productCount)*100);

                 categoryCount.push({
                    [category]:percentOfTotal
                 })
      })
    let modifiedTopFourOrders =  topFourOrders.map((order)=>({
        _id:order._id ,
        discount:order.discount ,
        amount:order.total ,
        quantity:order.orderItems.length ,
        status:order.status,
      }) )

             stats={
                count,
                percentChange,
                chart:{
                    order:SixMonthOrders,
                    revenue:SixMonthRevenue
                },
                categoryCount,
                userRatio:{
                    male: userMaleCount,
                    female: userCount-userMaleCount
                },
                topFourOrders:modifiedTopFourOrders
                
             }
             myCache.set(key , JSON.stringify(stats));  // invalidate  ( admin-stats )  on (PRODUCT USER ORDER MODEL) CHNAGE ( update ,delete,add )
        }

        res.status(200).json({
            success:true,
            stats
        })

    }
)


export const getPie = tryCatch (                                 // orderfullment ratio
    async(req , res , next)=>{                                  // category counts
        //api/v1/dashborad/pie                                   // in/out of stock 
        let key = "admin-pie-charts";                              // revenue distribution
        let pie;                                                  //useragegroup // admincutomer

        if ( myCache.has(key) ) {

            pie = JSON.parse ( myCache.get(key) as string ) ;


        }
        else{

            let [ processingOrders , shippedOrders , deliveredOrders , productCategories , totalProducts , inStock , totalOrders , totalUsersDob ,  totalAdmin , totalUsersCustomers  ] = await Promise.all( [
                  //order fullfillment ratio
               Order.countDocuments({status:"Processing"}) ,
               Order.countDocuments({status:"Shipped"}) ,
               Order.countDocuments({status:"Delivered"}) ,
               //category count ratio
               Product.distinct("category"),
                // in/out of stock 
               Product.countDocuments(),
               Product.countDocuments({stock:{$gte:1}}),
               // revenue distribution
               Order.find({}).select( ["total" ,"subTotal" ,"tax" , "shippingCharges" , "discount"  ] ) ,
               //useragegroup
               User.find({}).select(["dob"]),
              

               //admin customer
               User.countDocuments({role:"admin"}),
               User.countDocuments({role:"user"})
               
            ]);
           //order fullfillment ratio
           let orderfullfillmentRatio={
                processing : processingOrders,
                shipped : shippedOrders,
                delivered :deliveredOrders ,
            }
           

             // category counts
            let categoryPromises =  productCategories.map((category)=>Product.countDocuments({category})) 

            let categoriesCount = await Promise.all( categoryPromises ) ;    // do at once not synchronously
            
            


              // in/out of stock 
              let stockRatio={
                inStock,
                outOfStock:totalProducts-inStock
              }


              // revenue distribution
              let grossTotal = totalOrders.reduce((discount , order)=>discount+=order.total , 0)  ;
              let discount= totalOrders.reduce((discount , order)=>discount+=order.discount , 0)  ;
              let productionCost=totalOrders.reduce((discount , order)=>discount+=order.shippingCharges , 0)  ;
              let burnt = totalOrders.reduce((discount , order)=>discount+=order.tax , 0)  ;
              let marketingCost = Math.round((30/100)*grossTotal) ;
              let netMargin=grossTotal-discount -productionCost-burnt-marketingCost;
              
              let revenueDistribution={
                   netMargin,
                   discount,
                   productionCost,
                   burnt,
                   marketingCost,
              }
              //useragegroup
              let teenager=0;
              let adult=0;
              let older=0;

              totalUsersDob.forEach((user)=>{
                                                    //virtual attribute age is not part of user model its calculated onthe go by .operator
                                                    // so only accessible by . operator and at that time the user should have dob as well
             if (user.age<=19)teenager++;
             else if (user.age>=20 && user.age<=40)adult++;
             else older++

              })



              let userAgeGroup={
                teenager,
                adult,
                older
              }

              //admincustomer count
              let adminCustomer={
                admin:totalAdmin,
                user:totalUsersCustomers
              }
  
           pie={
            orderfullfillmentRatio,
            categoryObj:{
              category:productCategories,
              count : categoriesCount
            },    
            stockRatio,
            revenueDistribution,
            userAgeGroup,
            adminCustomer
           }
            myCache.set(key , JSON.stringify(pie)); 
        }

        res.status(200).json({
            success:true,
            pie
        })
        
    }
)
export const getBar = tryCatch (      
                                         //api/v1/dashboard/bar
    async(req , res , next)=>{              //12 month orders
                                            // 6month users and products     
      let key = "admin-bar-charts";                              
      let bar;                                                 

      if ( myCache.has(key) ) {

          bar = JSON.parse ( myCache.get(key) as string ) ;
          

      } 
      else{
        //

        let currentDate   = new Date() ;
        let OneYearStartDate = new Date( currentDate.getFullYear() , currentDate.getMonth()-11 , 1 ) ;
        let sixMonthStartDate = new Date( currentDate.getFullYear() , currentDate.getMonth()-5 , 1 ) ;

        let[oneYearOrders , products , users]= await Promise.all([
           //12 month orders
              Order.find({createdAt:{$gte:OneYearStartDate}}) , 
              // 6month users and products
              Product.find({createdAt:{$gte:sixMonthStartDate}}) , 
              User.find({createdAt:{$gte:sixMonthStartDate}}) , 
        ]);
         // 12 month orders
        let twelveMonthsOrders = mapLastMonthsData ( { length:12 , documentArr:oneYearOrders } ) ;

        // 6month users and products
        let sixMonthProducts = mapLastMonthsData({length:6 , documentArr:products});
        let SixMonthUsers = mapLastMonthsData({length:6 , documentArr:users});




        bar = {
          orderThorughoutYear:twelveMonthsOrders,
          SixMonthsProductAndUsers:{
            Products:sixMonthProducts,
            users:SixMonthUsers

          }

        }

        myCache.set( key , JSON.stringify( bar ) ) ;

      }

      res.status(200).json({
        success:true,
        bar
    })
        
    }
)
export const getLine = tryCatch(
    async(req , res , next)=>{                                                  // api/v1/dashbord/line     
                                                                                //  past 1 year users
      let key = "admin-line-charts";                                            //                         
      let line;                                                                 //                               
                                                                                //
      if ( myCache.has(key) ) {                                                 // 
                                                                                //
          line = JSON.parse ( myCache.get(key) as string ) ;

          
      } 
      else {
        let currentDate   = new Date() ;
        let OneYearStartDate = new Date ( currentDate.getFullYear() , currentDate.getMonth()-11 , 1 ) ;
     

        let[Users , Products , Orders]= await Promise.all( [
          User.find({createdAt:{$gte:OneYearStartDate}}),
          Product.find({createdAt:{$gte:OneYearStartDate}}),

          Order.find({createdAt:{$gte:OneYearStartDate}}) ,
           
        ]);

        let OneYearAcitveUsers= mapLastMonthsData(  { length:12 , documentArr:Users } ) ;
        let OneYearProducts =    mapLastMonthsData( { length:12 , documentArr:Products } ) ;

       
         let OneYearRevenue= new Array(12).fill(0) ;
         let OneYearDiscount= new Array(12).fill(0) ;

         Orders.forEach( (order )=> {

          let orderMonth = order.createdAt.getMonth() ;

            //  from current month how much far is a month
          let differMonth = ( currentDate.getMonth() - orderMonth + 12 ) % 12; //  +12 becz the month could be in diff years so differnce gose negative
                                                                               // %12 to not get >= 12

          OneYearRevenue[12-differMonth-1] += order.total;
          OneYearDiscount[12-differMonth-1] +=order.discount;
        })

        line={
          OneYearAcitveUsers,
          OneYearProducts,
          OneYearRevenue,
          OneYearDiscount
        }

        myCache.set( key , JSON.stringify( line ) ) ;

      }

      res.status(200).json({
        success:true,
        line
    })
        
    }
)