const userModel = require("../models/userModel")
const jwt = require('jsonwebtoken')
const aws = require("aws-sdk");
const bcrypt = require('bcrypt');
const validators = require("../validator/validator")
const mongoose = require('mongoose')


//////////////////////////////////////////AWS CONNECTION//////////////////////////////////////////////////////////////////////////////////////////////
aws.config.update({
    accessKeyId: "AKIAY3L35MCRUJ6WPO6J",
    secretAccessKey: "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",
    region: "ap-south-1"
})

let uploadFile = async(file) => {
    return new Promise(function(resolve, reject) {

        let s3 = new aws.S3({ apiVersion: '2006-03-01' });
        var uploadParams = {
            ACL: "public-read",
            Bucket: "classroom-training-bucket",
            Key: "abc/" + file.originalname,
            Body: file.buffer
        }


        s3.upload(uploadParams, function(err, data) {
            if (err) {
                return reject({ "error": err })
            }
            // console.log(data)
            console.log("file uploaded succesfully")
            return resolve(data.Location)
        })
    })
}

////////////////////////////////////////////////////////////VALIDATIONS//////////////////////////////////////////////////////////////////////////////////////

const isValidRequestBody = function(requestBody) {
    return Object.keys(requestBody).length > 0;
}


const isValid = function(value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}

const isValidfiles = function(files) {
    if (files && files.length > 0)
        return true
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const createUser = async(req, res) => {

    try {


        const data = JSON.parse(req.body.data)

        const { fname, lname, email, phone, password, address, } = data


        const files = req.files
        if (!isValidfiles(files)) {
            res.status(400).send({ status: false, Message: "Please provide profile picture" })
            return
        }

        if (!isValidRequestBody(data))

            return res.status(400).send({ status: false, msg: "Invalid data , Please enter data" })

        //=======================================================FNAME VALIDATION================================================================================

        if (!isValid(fname))

            return res.status(400).send({ status: false, msg: "please enter first name" })

        if (!(/^[a-zA-Z]+(\s[a-zA-Z]+)?$/).test(fname))

            return res.status(400).send({ status: false, msg: "Please use valid type of name" })

        //=======================================================LNAME VALIDATION================================================================================


        if (!isValid(lname))

            return res.status(400).send({ status: false, msg: "please enter last name" })

        if (!(/^[a-zA-Z]+(\s[a-zA-Z]+)?$/).test(lname))

            return res.status(400).send({ status: false, msg: "Please use valid type of lname" })

        //=======================================================EMAIL VALIDATION================================================================================

        if (!isValid(email))


            return res.status(400).send({ status: false, msg: "please enter email" })

        if (!(/^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,20}$/).test(email)) {
            return res.status(400).send({ status: false, msg: "Please provide a email in correct format" })
        }
        let duplicateEmail = await userModel.findOne({ email: data.email })
        if (duplicateEmail) {
            return res.status(400).send({ status: false, msg: 'email already exists' })
        }

        //=======================================================PHONE VALIDATION================================================================================

        if (!isValid(phone))
            return res.status(400).send({ status: false, msg: "please enter phone number " })

        if (!(/^\d{10}$/).test(phone)) {
            return res.status(400).send({ status: false, msg: "please provide a valid phone Number" })
        }

        let duplicatePhone = await userModel.findOne({ phone: data.phone })
        if (duplicatePhone) {
            return res.status(400).send({ status: false, msg: 'Phone already exists' })
        }

        //var profileImage = await uploadFile(files[0])

        //=======================================================PASSWORD VALIDATION================================================================================

        if (!isValid(password)) {
            return res.status(400).send({ status: false, message: 'password is required' })
        }

        if (!(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,15}$/.test(data.password))) {
            return res.status(400).send({ status: false, msg: "Please use first letter in uppercase, lowercase and number with min. 8 length" })
        }

        //=======================================================ADDRESS VALIDATION================================================================================

        if (!isValid(address)) {
            return res.status(400).send({ status: false, message: 'address is required' })
        }
        if (address) {
            if (address.shipping) {
                if (!isValid(address.shipping.street)) {
                    return res.status(400).send({ status: false, message: 'street is required' })

                }
                //address match with regex 
                if ((!isValid(address.shipping.city)) || !(/^[a-zA-Z]*$/).test(address.city)) {
                    return res.status(400).send({ status: false, message: 'city is required' })

                }
                //pincode match with regex
                if (!isValid(address.shipping.pincode)) {
                    return res.status(400).send({ status: false, message: 'Enter the pincode and only in 6 digits' })
                }
            }

            if (address.billing) {

                if (!isValid(address.billing.street)) {
                    return res.status(400).send({ status: false, message: 'street is required' })

                }
                //address match with regex 
                if ((!isValid(address.billing.city)) || !(/^[a-zA-Z]*$/).test(address.city)) {
                    return res.status(400).send({ status: false, message: 'city is required' })

                }
                //pincode match with regex
                if (!isValid(address.billing.pincode)) {
                    return res.status(400).send({ status: false, message: 'Enter the pincode and only in 6 digits' })
                }
            }
        }
        //=======================================================HASH PASSWORD================================================================================


        const saltRounds = 10
        const encryptedPassword = await bcrypt.hash(password, saltRounds)

        //=======================================================CREATE USER================================================================================

        const profilePicture = await uploadFile(files[0])
        const userData = {
            fname: fname,
            lname: lname,
            profileImage: profilePicture,
            email: email,
            phone,
            password: encryptedPassword,
            address: address
        }
        let createuser = await userModel.create(userData)
        return res.status(201).send({ status: true, data: createuser })


    } catch (err) {
        console.log(err)
        return res.status(500).send({ status: false, msg: err.message })
    }

}

/////////////////////////////////////////////////////////////////LOG-In-API/////////////////////////////////////////////////////////////////////////

const login = async function(req, res) {

    try {

        let data = req.body

        if (!validators.isValidRequestBody(data)) {
            return res.status(400).send({ status: false, message: "Data is Required" })
        }

        //=======================================================EMAIL VALIDATION================================================================================


        if (!validators.isValidField(data.email)) {
            return res.status(400).send({ status: false, message: "Email Field is missing" })
        }

        //=======================================================PASSWORDD VALIDATION================================================================================


        if (!validators.isValidField(data.password)) {
            return res.status(400).send({ status: false, message: "Password field is missing" })
        }

        //=======================================================AUNNTHENTICATION================================================================================


        let Email = await userModel.findOne({ email: data.email })

        if (!Email) {
            return res.status(400).send({ status: false, message: "Email Doesn't exist" })
        }

        const decryptedPassword = await bcrypt.compare(data.password, Email.password)

        if (!decryptedPassword) {
            return res.status(400).send({ status: false, message: "Password is incorrect" })
        }

        let userId = Email._id

        let token = jwt.sign({ userId: userId }, "Uranium-Project-5-Group-29", { expiresIn: '1h' })

        return res.status(201).send({ status: true, message: "Token Successfully created", data: token })

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

////////////////////////////////////////////////////////////GET-API/////////////////////////////////////////////////////////////////////////////////

const getUser = async function(req, res) {

    try {
        const userId = req.params.userId

        //=======================================================VALIDATION================================================================================


        if (!validators.isValidField(userId)) {

            return res.status(400).send({ status: false, message: "UserId must pe present" })
        }


        if (!mongoose.isValidObjectId(userId)) {

            return res.status(400).send({ status: false, message: "UserId must be valid" })
        }

        const findUser = await userModel.findById({ _id: userId })

        if (!(req.userId === findUser.userId)) {

            return res.status(400).send({ status: false, message: "Unauthorised access" })
        }

        if (!findUser) {

            return res.status(400).send({ status: false, message: "user is not prsent" })

        } else {

            return res.status(200).send({ status: true, message: "data is given", data: findUser })
        }
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}


/////////////////////////////////////////////////////////////////////PUT-API/////////////////////////////////////////////////////////////////////////


const updateProfile = async(req, res) => {
    try {

        const data = JSON.parse(req.body.data)

        const files = req.files
        let Id = req.params.userId

        //=======================================================VALIDATION================================================================================


        if (!isValid(data))
            return res.status(400).send({ status: false, msg: "Please enter data for update" })

        if (!validators.isValidObjectId(Id))
            return res.status(400).send({ status: false, msg: "enter valid user Id" })

        let user = await userModel.findOne({ _id: Id })
        if (!user)
            return res.status(400).send({ status: false, msg: "user not found" })

        if (!validators.isValidRequestBody(data))
            return res.status(400).send({ status: false, msg: "provide detail to update" })

        // if (!data.fname || data.lname || data.email || data.phone || files.profileImage || data.password || data.address)
        //     return res.status(400).send({ status: false, mag: "please provide some data to update" })

        // if (!(/^[a-zA-Z]+(\s[a-zA-Z]+)?$/).test(data.fname))
        //     return res.status(400).send({ status: false, msg: "Please use valid type of fname" })

        //=======================================================LNAME VALIDATION================================================================================


        if (!(/^[a-zA-Z]+(\s[a-zA-Z]+)?$/).test(data.lname))
            return res.status(400).send({ status: false, msg: "Please use valid type of lname" })

        //=======================================================EMAIL VALIDATION================================================================================


        if (!(/^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,20}$/).test(data.email)) {
            return res.status(400).send({ status: false, msg: "Please provide a email in correct format" })
        }
        let duplicateEmail = await userModel.findOne({ email: data.email })
        if (duplicateEmail) {
            return res.status(400).send({ status: false, msg: 'email already exists' })
        }

        //=======================================================PHONE VALIDATION================================================================================



        if (!(/^\d{10}$/).test(DATA.phone)) {
            return res.status(400).send({ status: false, msg: "please provide a valid phone Number" })
        }

        let duplicatePhone = await userModel.findOne({ phone: data.phone })
        if (duplicatePhone) {
            return res.status(400).send({ status: false, msg: 'Phone already exists' })
        }


        //=======================================================HASH PASSWORD================================================================================


        const saltRounds = 10
        const encryptedPassword = await bcrypt.hash(data.password, saltRounds)

        //==========================================================UPDATE=====================================================================================

        let updateprofile = await userModel.findByIdAndUpdate({ _id: Id }, { fname: data.fname, lname: data.lname, email: data.email, address: data.address, phone: data.phone, password: encryptedPassword, profileImage: files.profileImage, })
        return res.status(200).send({ status: true, message: "User profile updated", data: updateprofile })


    } catch (error) {
        console.log(error)
        return res.status(500).send({ status: false, msg: error.message })
    }
}


//============================================================EXPORTS==================================================================================

module.exports.createUser = createUser
module.exports.login = login
module.exports.getUser = getUser
module.exports.updateProfile = updateProfile