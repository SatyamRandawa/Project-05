const userModel = require("../models/userModel")
const aws = require("aws-sdk");
const bcrypt = require('bcrypt');
const validators = require("../validator/validator")
const saltRounds = 10

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

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
createUser = async(req, res) => {

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

        if (!isValid(fname))

            return res.status(400).send({ status: false, msg: "please enter first name" })

        if (!(/^[a-zA-Z]+(\s[a-zA-Z]+)?$/).test(fname))

            return res.status(400).send({ status: false, msg: "Please use valid type of name" })



        if (!isValid(lname))

            return res.status(400).send({ status: false, msg: "please enter last name" })

        if (!(/^[a-zA-Z]+(\s[a-zA-Z]+)?$/).test(lname))

            return res.status(400).send({ status: false, msg: "Please use valid type of lname" })



        if (!isValid(email))


            return res.status(400).send({ status: false, msg: "please enter email" })

        if (!(/^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,20}$/).test(email)) {
            return res.status(400).send({ status: false, msg: "Please provide a email in correct format" })
        }
        let duplicateEmail = await userModel.findOne({ email: data.email })
        if (duplicateEmail) {
            return res.status(400).send({ status: false, msg: 'email already exists' })
        }



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


        if (!isValid(password)) {
            return res.status(400).send({ status: false, message: 'password is required' })
        }

        if (!(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,15}$/.test(data.password))) {
            return res.status(400).send({ status: false, msg: "Please use first letter in uppercase, lowercase and number with min. 8 length" })
        }


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


        const profilePicture = await uploadFile(files[0])

        const encryptedPassword = await bcrypt.hash(password, saltRounds)

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


module.exports.createUser = createUser

//----------------------------------------------------------------LOG-In-API----------------------------------------------

const login = async function(req, res) {

    try {

        let data = req.body

        if (!validators.isValidRequestBody(data)) {
            return res.status(400).send({ status: false, message: "Data is Required" })
        }

        if (!validators.isVaidField(data.email)) {
            return res.status(400).send({ status: false, message: "Email Field is missing" })
        }

        if (!validators.isValidField(data.password)) {
            return res.status(400).send({ status: false, message: "Password field is missing" })
        }

        let Email = await userModel.findOne({ email: data.email })

        if (!Email) {
            return res.status(400).send({ status: false, message: "Email Doesn't exist" })
        }

        const decryptedPassword = await bcrypt.compare(data.password, Email.password)

        if (!decryptedPassword) {
            return res.status(400).send({ status: false, message: "Password is incorrect" })
        }




    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

module.exports.login = login