const express = require('express');
const router = express.Router();
const uploadController = require("../uploadController/upload")


router.post("/Upload-aws-files",uploadController.create)













module.exports = router;