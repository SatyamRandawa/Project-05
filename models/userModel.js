const mongoose = require('mongoose')
const { required } = require('nodemon/lib/config')

const userSchema = new mongoose.Schema({

    fname: { type: String, mandatory: true },
    lname: { type: String, mandatory: true },
    email: { type: String, mandatory: true, unique: true },
    profileImage: { type: String, mandatory: true }, // s3 link
    phone: { type: Number, mandatory: true, unique: true },
    password: { type: String, mandatory: true, min: 8, max: 15 }, // encrypted password
    address: {
        shipping: {
            street: { type: String, mandatory: true },
            city: { type: String, mandatory: true },
            pincode: { type: Number, mandatory: true }
        },
        billing: {
            street: { type: String, mandatory: true },
            city: { type: String, mandatory: true },
            pincode: { type: Number, mandatory: true }
        }
    },
    
}, { timestamps: true })


module.exports = mongoose.model("User", userSchema);