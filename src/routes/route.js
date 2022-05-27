const express = require('express')
const router = express.Router();
const UserController = require("../controller/userRegister")

const ProductController = require("../controller/productController")



//==============================================USER-FEATURE-1================================================

router.post("/register", UserController.createUser)
router.post("/login", UserController.login)
router.get("/get/user/:userId", UserController.getUser)
router.put("/user/:userId/profile", UserController.updateProfile)

//===========================================PRODDUCT-FEATURE-2=================================================

router.post("/products", ProductController.createProduct)

router.get("/products/:productId", ProductController.getProductByID)
router.delete("/products/:productId", ProductController.deleteProductById)








module.exports = router