class ErrorHandler extends Error {
  //  error class has name , mesage  we are adding {stausCode} by extending the class 
  

    constructor(public message:string , public statusCode:number)
    {
       super(message);
       this.statusCode=statusCode;
    }

}
export default ErrorHandler