const express = require('express')
const router = express.Router();
const UserController = require("../controller/userRegister")



router.post("/register", UserController.createUser)
router.post("/login", UserController.login)
router.get("/ getUser", UserController.getUser)







module.exports = router