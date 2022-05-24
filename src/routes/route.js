const express = require('express')
const router = express.Router();
const UserController = require("../controller/userRegister")



router.post("/register",UserController.createUser)








module.exports = router