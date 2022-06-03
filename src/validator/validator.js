const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId

const isValidField = function(value) {
    if (typeof value === 'undefined' || value === null) return false;

    if (typeof value === 'string' && value.trim().length === 0) return false;

    return true;
};

const isValidRequestBody = function(requestBody) {
    return Object.keys(requestBody).length > 0;
};

const isValidURL = function(link) {
    return (/^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/.test(link));
}

const isValidMobileNo = function(mobile) {
    return (/((\+91)?0?)?[1-9]\d{9}/.test(mobile));
};

const isValidEmail = function(email) {
    return (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email));
};

const isValidObjectId = function(objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)

}

const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    if (typeof value === 'number' && value.toString().trim().length === 0 ) return false
    return true
};

const vaildQuantity = function isInteger(value){
    if(value<1) return false
  
    if(value % 1 ===0)  return true
}

// Validation of Name of City
const isValidCity = (City) => {
    const CityNameFormat = /^[A-Za-z\s]+$/
    if (CityNameFormat.test(City)) {
        return true
    } else {
        return false
    }
}
// Validation of indian Pincode
const isValidPin = (pincode) => {
    const pincodeFormat = /^[1-9]{1}[0-9]{2}[0-9]{3}$/
    if (pincodeFormat.test(pincode)) {
        return true
    } else {
        return false
    }
}


module.exports = { isValidField,isValidPin, isValidRequestBody, isValidEmail, isValidMobileNo, isValidURL,isValidCity ,isValidObjectId,isValid,vaildQuantity};