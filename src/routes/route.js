const express = require('express')
const router = express.Router();
const UserController = require("../controller/userRegister")



router.post("/register", UserController.createUser)
router.post("/login", UserController.login)
router.get("/get/user/:userId", UserController.getUser)
router.put("/user/:userId/profile", UserController.updateProfile)







module.exports = router