const orderModel = require("../models/orderModel")
const userModel = require("../models/userModel")
const productModel = require("../models/productModel")
const validators = require("../validator/validator")
const { default: mongoose } = require("mongoose")
const cartModel = require("../models/cartModel")


/*************Create Order Api*****************/

const createOrder = async (req, res)=>{
    try{
        let userid = req.params.userId
        let tokenId = req.userId


        let user =  req.userId
        if (userid !== user) {
            return res.status(401).send({ status: false, message: "Unauthorized access! Owner info doesn't match" });
        }
 
        if(! validators.isValidRequestBody  (userid)){
            return res.status(400).send({status : false, messsage : "user Id is missing in length"})
        }
 
        if(!mongoose.isValidObjectId(userid)){
            return res.status(400).send({status : false, message : "Please provide a valid user Id"})
        }
 
        let findUser = await userModel.findById({_id : userid})
        if(findUser){
            if(tokenId != userid){
                return res.status(401).send({status : false, message :"you are unauthorized to do this"})
            }
        }else{
            return res.status(404).send({status : false, message : "No user with this id exists"})
        }
 
        let data = req.body
 
        if(!validators.isValidRequestBody(data)){
            return res.status(400).send({status : false, message : "No input has been provided"})
        }
 
        let {status, cancellable} = data
        
        if(!userid){
            return res.status(400).send({status : false, message : "User Id is a required field"})
        }
 
        if(!validators.isValidRequestBody(userid)){
            return res.status(400).send({status: false, message : "userId id is missing in length"})
        }
 
        if(mongoose.isValidObjectId(userid)=== false){
            return res.status(400).send({status : false, message : "please provide a valid cartId"})
        }
 

 
        if (!["pending", "completed", "canceled"].includes(status)) {
            return res.status(400).send({ status: false, msg: "Title must includes['Mr','Miss','Mrs']" })
        }

        if(cancellable){
            if(["true", "false"].includes(cancellable) === false){
                return res.status(400).send({status : false, message : "cancellable only take a boolean value"})
            }
        }
 
        let findCart = await cartModel.findOne({userId : userid})
       
 
        if(!findCart){
            return res.status(404).send({status : false, message : " No cart with this cart id exists"})
        }
 
        if(findCart.userId != userid){
            return res.status(401).send({status : false, message : "This cart does not belong to you"})
        }
 
        let totalQuantity = 0;
        for(let i in findCart.items){
            totalQuantity += findCart.items[i].quantity
         }
 
        let orderData = {
            userId : userid,
            items : findCart.items,
            totalPrice : findCart.totalPrice,
            totalItems : findCart.totalItems,
            totalQuantity : totalQuantity,
            status : status,
            cancellable : cancellable
        }
 
        let createOrder = await orderModel.create(orderData)
        
        return res.status(201).send({status : true, message : "order created successfully", data : createOrder})

 
    } catch (error) {
        console.log(error)
         return res.status(500).send({ status: "error", message: error.message });
    }
 }

///////////////////////////////////////////////////////UPDATE ORDER/////////////////////////////////////////////////////////////////////////
const updateOrders = async (req, res) => {
    try {
        userid = req.params.userId
        product = req.body.productId
        orderStatus = req.body.status
        
        data = req.body


        if (!validators.isValidField(userid)) {

            return res.status(400).send({ status: false, message: "Provide userId in params" })
        }

        
    
        checkUser = await userModel.findOne({_id:userid})
        if(!checkUser){
            return res.status(404).send({status:false, msg:`this ${userid} user not found`})
        }

        let user =  req.userId
        if (userid !== user) {
            return res.status(401).send({ status: false, message: "Unauthorized access! Owner info doesn't match" });
        }

        if(!validators.isValidRequestBody(data)){
            return res.status(400).send({status:false, msg:"please provide data in body to update"})
        }


        if(!['pending', 'completed', 'canceled'].includes(orderStatus)){
            return res.status(400).send({status:false, msg:"status must include - ['pending', 'completed', 'canceled']  "})
        }
        
        let checkcancel = await orderModel.findOne({userId:userid, cancellable:true})
        
        
        if(!checkcancel){
            if(orderStatus === 'canceled'){
                return res.status(400).send({status:false, msg:"You cant cancel this order"})
            }
        }



        let updateorder = await orderModel.findOneAndUpdate({userId:userid}, {$set:{status:orderStatus, updatedAt:Date.now()}}, {new:true})
        .select({"_id":1, "userId":1, "items":1, "totalPrice":1, "totalItems":1, "totalQuantity":1,
        "cancellable":1, "status":1, "createdAt":1, "updatedAt":1})
        return res.status(400).send({status:true, msg:"status updated successfully", data:updateorder})



    } catch (error) {
        console.log(error)
        return res.status(500).send({status:false, mag:error.message})
    }


}


module.exports.createOrder = createOrder
module.exports.updateOrders = updateOrders