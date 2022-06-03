const express = require('express')
const router = express.Router();
const UserController = require("../controller/userRegister")
const  cartController = require("../controller/cartController")
const orderController = require("../controller/orderController")


const ProductController = require("../controller/productController")
const middleware = require('../middleware/authentication')



//==============================================USER-FEATURE-1================================================

router.post("/register", UserController.createUser)
router.post("/login", UserController.login)
router.get("/get/user/:userId",middleware.auth ,UserController.getUser)
router.put("/user/:userId/profile",middleware.auth,UserController.updateProfile)

//===========================================PRODDUCT-FEATURE-2=================================================

router.post("/products", ProductController.createProduct)
router.get("/products/:productId", ProductController.getProductByID)
router.delete("/products/:productId", ProductController.deleteProductById)
router.get("/products",ProductController.getproduct)
router.put("/products/:productId",ProductController.updateProduct)

//============================================CART-FEATURE-3=========================================================

router.post("/users/:userId/cart",middleware.auth,cartController.createCartByUserID)
router.put("/users/:userId/cart",middleware.auth,cartController.updateCart)
router.get("/users/:userId/cart",middleware.auth, cartController.getCartByUserID)
router.delete("/users/:userId/cart",middleware.auth, cartController.deleteCart)


//=============================================OREDER-FEATURE-4=========================================================

router.post("/users/:userId/orders",middleware.auth, orderController.createOrder)
router.put("/users/:userId/orders",middleware.auth,orderController.updateOrders)







module.exports = router