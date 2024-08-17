export interface NewUserRequestBody {

    name:string;
    email:string;
    photo:string;
    dob:string;
    gender:string;
    _id :string;
    role:string

}
export interface NewProductRequestBody {

    name:string;
    price:number;
    category:string;
    stock:number

}

export interface filterdataType {

    name?:{
        $regex:string,
        $options:string
    },
    price?:{
        $lte:number
    },
    category?:string,

    
    }


export interface FilterDataTypeForQuery{
    name ?: string,
    price?:string, 
    category?:string,
    sort?:string,
    page?:string
}

export interface invalidateCacheDataType{
    product?:boolean,
    order?:boolean,
    admin?:boolean,

    productIds?:string[],
    userId?:string
    orderId?:string
}

export type ShippingInfoType={

    adress:string,
    city:string,
    state:string,
    country:string,
    pinCode:number,

}
export type orderItemType={
    name:string,
    photo:string,
    price:number,
    quantity:number,
    stock:number,
    _id:string,

}
export interface newOrderDataType{

    shippingInfo:ShippingInfoType, 

    user:string,

    subTotal:number,
    tax:number,
    shippingCharges:number,
    discount:number
    total:number,

    orderItems:orderItemType[]
}