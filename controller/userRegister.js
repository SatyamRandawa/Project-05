const { create } = require("../models/userModel")
const userModel = require("../models/userModel")
const aws= require("aws-sdk")
//const bcrypt = require('bcrypt');
//const uploadFile = require("../aws/aws")

//////////////////////////////////////////AWS CONNECTION//////////////////////////////////////////////////////////////////////////////////////////////
aws.config.update({
    accessKeyId: "AKIAY3L35MCRUJ6WPO6J",
    secretAccessKey: "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",
    region: "ap-south-1"
})

let uploadFile= async ( file) =>{
    return new Promise( function(resolve, reject) {
     
     let s3= new aws.S3({apiVersion: '2006-03-01'}); 
     var uploadParams= {
         ACL: "public-read",
         Bucket: "classroom-training-bucket",  
         Key: "abc/" + file.originalname,  
         Body: file.buffer
     }
 
 
     s3.upload( uploadParams, function (err, data ){
         if(err) {
             return reject({"error": err})
         }
        // console.log(data)
         console.log("file uploaded succesfully")
         return resolve(data.Location)
     })
    })
 }

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}

createUser = async (req, res) => {
    try{
        let files= req.files
        let data = req.body

    if(!Object.keys(data).length)
    return res.status(400).send({status:false, msg:"please enter data"})

    if(!isValid(data.fname))
    return res.status(400).send({status:false, msg:"please enter first name"})

    if (!(/^[a-zA-Z]+(\s[a-zA-Z]+)?$/).test(data.fname)) 
    return res.status(400).send({ status: false, msg: "Please use valid type of name" })



    if(!isValid(data.lname))
    return res.status(400).send({status:false, msg:"please enter last name"})
    
    if (!(/^[a-zA-Z]+(\s[a-zA-Z]+)?$/).test(data.lname)) 
    return res.status(400).send({ status: false, msg: "Please use valid type of lname" })



    if(!isValid(data.email))
    return res.status(400).send({status:false, msg:"please enter email"})

    if (!(/^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,20}$/).test(data.email)) {
        return res.status(400).send({ status: false, msg: "Please provide a email in correct format" })
    }
    let duplicateEmail = await userModel.findOne({ email: data.email })
        if (duplicateEmail) {
            return res.status(400).send({ status: false, msg: 'email already exists' })
        }



    if(!isValid(data.phone))
    return res.status(400).send({status:false, msg:"please enter phone number "})

    if (!(/^\d{10}$/).test(data.phone)) {
        return res.status(400).send({ status: false, msg: "please provide a valid phone Number" })
    }
    
    let duplicatePhone = await userModel.findOne({ phone: data.phone })
    if (duplicatePhone) {
        return res.status(400).send({ status: false, msg: 'Phone already exists' })
    }

    var profileImage = await uploadFile(files[0])


    if (!isValid(data.password)) {
        return res.status(400).send({ status: false, message: 'password is required' })
    }
    
    if (!(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,15}$/.test(data.password))) {
        return res.status(400).send({ status: false, msg: "Please use first letter in uppercase, lowercase and number with min. 8 length" })
    }

    
   
//    const salt = await bcrypt.genSalt(10);
//    const hashed = await bcrypt.hash(password, salt);
   
//     hashIt(password);
//    // compare the password user entered with hashed pass.
//    async function compareIt(password){
//    const validPassword = await bcrypt.compare(password, hashedPassword);
//   }
//   compareIt(password);

if (!isValid(data.address)) {
    return res.status(400).send({ status: false, message: 'address is required' })
}
if (data.address.shipping) {
    if (!isValid(data.address.shipping.street)) {
        return res.status(400).send({ status: false, message: 'street is required' })
        
    }
    //address match with regex 
    if ((!isValid(data.address.shipping.city))|| !(/^[a-zA-Z]*$/).test(address.city)) {
        return res.status(400).send({ status: false, message: 'city is required' })
       
    }
    //pincode match with regex
    if ((!isValid(data.address.shipping.pincode)) || !(/^\d{6}$/).test(address.pincode) ) {
        return res.status(400).send({ status: false, message: 'Enter the pincode and only in 6 digits'})
    }

    if (!isValid(data.address.billing.street)) {
        return res.status(400).send({ status: false, message: 'street is required' })
        
    }
    //address match with regex 
    if ((!isValid(data.address.billing.city))|| !(/^[a-zA-Z]*$/).test(address.city)) {
        return res.status(400).send({ status: false, message: 'city is required' })
       
    }
    //pincode match with regex
    if ((!isValid(data.address.billing.pincode)) || !(/^\d{6}$/).test(address.pincode) ) {
        return res.status(400).send({ status: false, message: 'Enter the pincode and only in 6 digits'})
    }
}

data["profileImage"] = profileImage

let createuser = await userModel.create(data)
return res.status(201).send({status:true, data:createuser})


    }catch(err){
          console.log(err)
          return res.status(500).send({status:false, msg:err.message})
    }

}

module.exports.createUser = createUser