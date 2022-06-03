const cartModel = require("../models/cartModel")
const productModel = require("../models/productModel")
const userModel = require("../models/userModel")
const mongoose = require('mongoose')
const validators = require("../validator/validator")
const { APIGateway } = require("aws-sdk")
const { add } = require("nodemon/lib/rules")
const { findByIdAndUpdate, find } = require("../models/cartModel")
const { satisfies } = require("nodemon/lib/utils")


const isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}
const isValidRequestBody = function(requestBody) {
    return Object.keys(requestBody).length > 0;
};








const createCartByUserID = async (req, res) => {
    try {
        let userId = req.params.userId
        data = req.body
        var {items} = data
        const {quantity, productId} = items


        let user =  req.userId
        if (userId !== user) {
            return res.status(401).send({ status: false, message: "Unauthorized access! Owner info doesn't match" });
        }
//================================================VALIDATION====================================================================================

        if (!userId) return res.status(400).send({ status: false, msg: " Please enter userId " })
        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, msg: " userId  is not valid " })
        let findUser = await userModel.findById({ _id: userId })
        if (!findUser) return res.status(404).send({ status: false, msg: " user does not exixts " })
        if (!items.productId || !validators.isValidField(items.productId)) return res.status(400).send({ status: false, msg: " Please enter productId " })
        if (!isValidObjectId(items.productId)) return res.status(400).send({ status: false, msg: " productId  is not valid " })
        if (!validators.isValidField(items.quantity)) return res.status(400).send({ status: false, msg: " Please enter valid quantity " })
        if (items.quantity < 1) return res.status(400).send({ status: false, msg: " Number of items.quantity can't be less than 1 " })

        //const findExistCart = await cartModel.findOne({ userId: userId})
//================================================PRODUCT VALIDATION====================================================================================

        const checkproductData = await productModel.findOne({_id:productId})
        if(!checkproductData){
            return res.status(404).send({status:false, msg:"product not available"});
        };

//================================================CREATE CART====================================================================================

        findPrice = checkproductData.price * quantity
        const checkcart = await cartModel.findOne({userId:userId})
        if(!checkcart){
            let Cart = {
                userId:userId,
                items:[{
                    productId:productId,
                    quantity: quantity,
                }],
               
                totalPrice:findPrice,
                totalItems:1
            }
            
             const createCart = await cartModel.create(Cart);
             res.status(201).send({status:true, msg:"cart is created successfully", data:createCart});
            
        }
//================================================ADD PRODUCTS====================================================================================


        if(checkcart){
             let updateprice = checkcart.totalPrice + (items.quantity * checkproductData.price )
             let cartItems = checkcart.items


             for(i=0; i<cartItems.length; i++){
                 if(cartItems[i].productId.toString() === productId){
                     cartItems[i].quantity += quantity

                     let updateCart = {items:cartItems, totalPrice:updateprice, totalItems:cartItems.length}

                     let goForUpdate = await cartModel.findOneAndUpdate({_id:checkcart._id},updateCart,{new:true})

                     return res.status(201).send({status:true, message:"product added", data:goForUpdate})
                 }
             }
              
             cartItems.push({productId:productId, quantity:quantity})
             let incProduct = { items:cartItems, totalPrice:updateprice, totalItems:cartItems.length}
             let goForInc = await cartModel.findOneAndUpdate({_id:checkcart._id},incProduct,{new:true} )
              return res.status(201).send({status:true, message:"product added successfully", data:goForInc})
        }



    } catch (error) {
        console.log(error)
        return res.status(500).send({ status: false, msg: error.message })
    }
}

        
    
////////////////////////////////////////////////////////UPDATE CART////////////////////////////////////////////////////////////////////////////////////////////////



const updateCart = async function(req, res) {
    try {

        const userId = req.params.userId
        const jwtId = req.userId
        const data = req.body
        const { cartId, productId, removeProduct } = data
    

//===============================================VALIDATIONS====================================================================================


        if (!validators.isValidRequestBody(data)) {

            return res.status(400).send({ status: false, message: "Please provide Data" })

        }
//================================================USERID VALIDATION====================================================================================

        if (!validators.isValidField(userId)) {

            return res.status(400).send({ status: false, message: "Provide userId in params" })
        }

        if (!validators.isValidObjectId(userId)) {

            return res.status(400).send({ status: false, message: "Provide Valid userId" })
        }
//================================================CARTID VALIDATION====================================================================================

        if (!validators.isValidField(cartId)) {

            return res.status(400).send({ status: false, message: "Provide CartId" })
        }

        if (!validators.isValidObjectId(cartId)) {

            return res.status(400).send({ status: false, message: "Provide Valid CartID" })
        }

//================================================PRODUCTID VALIDATION====================================================================================

        if (!validators.isValidField(productId)) {

            return res.status(400).send({ status: false, message: "Provide ProductID" })

        }

        if (!validators.isValidObjectId(productId)) {

            return res.status(400).send({ status: false, message: "Provide Valid ProductId" })
        }

        const cartPresent = await cartModel.findOne({ _id: cartId, userId:userId })
       // console.log(cartPresent)

        if (!cartPresent) {

            return res.status(404).send({ status: false, message: "cart DoesNot exist" })

        }

//================================================AUTHENTICATION VALIDATION====================================================================================


        if (!(userId === jwtId)) {

            return res.status(401).send({ status: false, message: "UnAuthorised Access" })
        }

//================================================USER VALIDATION====================================================================================

        const userPresent = await userModel.findOne({ _id: userId, isDeleted: false })

        if (!userPresent) {

            return res.status(404).send({ status: false, message: "User Does not exist" })
        }
//================================================PRODUCT VALIDATION====================================================================================


        const productPresent = await productModel.findOne({ _id: productId, isDeleted: false })

        if (!productPresent) {

            return res.status(404).send({ status: false, message: "Product does not exist" })
        }


        const isProductPresentInCart = await cartModel.findOne({ items: { $elemMatch: { productId: productId } } })

        if (!isProductPresentInCart) {

            return res.status(404).send({ status: false, message: "This product doesn't exist in cart" })
        }

//================================================REMOVEPRODUCT VALIDATION====================================================================================


        if (!(removeProduct === 0 || removeProduct === 1)) {

            return res.status(400).send({ status: false, message: "Remove product should be either 0 or 1" })
        }



        let items = cartPresent.items
        
        let productArr = items.filter(x => x.productId.toString() == productId)
        
        if (productArr.length == 0) {
            return res.status(404).send({ status: false, message: "Product is not present in cart" })
        }

        let index = items.indexOf(productArr[0])

        if (!validators.isValid(removeProduct)) {
            return res.status(400).send({ status: false, message: "Please enter removeProduct is missing in length" })
        }

        if (!([0, 1].includes(removeProduct))) {
            return res.status(400).send({ status: false, message: "RemoveProduct field can have only 0 or 1 value" })
        }

//---------------REMOVE-----------
        if (removeProduct == 0) {
            
            cartPresent.totalPrice == (cartPresent.totalPrice - (isProductPresentInCart.price * cartPresent.items[index].quantity)).toFixed(2)
            cartPresent.items.splice(index, 1)

            cartPresent.totalItems = cartPresent.items.length
            cartPresent.save()
        } 

        if (removeProduct == 1) {
          
            cartPresent.items[index].quantity -= 1
            cartPresent.totalPrice == (cartPresent.totalPrice - isProductPresentInCart.price).toFixed(2)
            
            if (cartPresent.items[index].quantity == 0) {
                cartPresent.items.splice(index,1)

            }
            cartPresent.totalItems = cartPresent.items.length

            cartPresent.save()

        }

        return res.status(200).send({ status: true, message : "change made successfully", data: cartPresent })


    } catch (error) {
        console.log(error)
        return res.status(500).send({ status: false, msg: error.message })

    }
}




////////////////////////////////////////////////////////////-GET -BY-USERID-API-//////////////////////////////////////////////////////////////////

const getCartByUserID = async(req, res) => {
    try {
        const jwtTokenId = req.userId
        let userId = req.params.userId

        if (!(userId === jwtTokenId)) {

            return res.status(400).send({ status: false, message: "Un-Authorised access" })
        }


        if (!isValidObjectId(userId)) return res.status(400).json({ status: false, message: " Object ID not valid" })
        let findUser = await userModel.findById(userId)
        if (!findUser) return res.status(404).json({ status: false, message: " user not found" })
        const ID = findUser._id
        const findCart = await cartModel.findOne({ userId: ID }).populate("userId", "fname lname phone")
        if (!findCart) return res.status(400).json({ status: false, message: "Your cart is Empty" })
        res.status(200).json({ status: true, message: findCart })

    } catch (error) {
          console.log(error)
        res.status(500).json({ status: false, message: error.message })

    }
}

////////////////////////////////////////////////////////////-DELETE /users/:userId/cartAPI-//////////////////////////////////////////////////////////////////

const deleteCart = async function(req, res) {

    try {

        const userId = req.params.userId
        const jwtTokenId = req.userId
//=================================================auth=======================================================================================
        if (!(userId === jwtTokenId)) {

            return res.status(401).send({ status: false, message: "Un-Authorised access" })
        }
//====================================================validations=============================================================================

        const checkCart = await cartModel.findOne({ userId: userId })

        if (!checkCart) {
            return res.status(404).send({ status: false, message: "Cart doesn't exist" })
        }

        const checkUser = await userModel.findById({ _id: userId })

        if (!checkUser) {

            return res.status(404).send({ status: false, message: "User does not exist" })
        }
//=========================================================delete=============================================================================
        const deleteCart = await cartModel.findOneAndUpdate({ userId: userId }, { items: [], totalPrice: 0, totalItems: 0 }, { new: true })

        res.status(200).send({ status: false, message: "Successfully deleted", data: deleteCart })

    } catch (error) {

        res.status(500).json({ status: false, message: error.message })

    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////








module.exports.createCartByUserID = createCartByUserID
module.exports.updateCart = updateCart
module.exports.getCartByUserID = getCartByUserID
module.exports.deleteCart = deleteCart