const jwt = require("jsonwebtoken");

const auth = async function(req, res, next) {
    try {
        
        let bearer = req.headers.authorization;

        if (typeof bearer == "undefined") return res.status(400).send({ status: false, message: "Token is missing, please enter a token" });

        let bearerToken = bearer.split(' ');

        let token = bearerToken[1];
        let decodedToken = jwt.verify(token, 'Uranium-Project-5-Group-29');

        if(!decodedToken){
            return res.status(400),send({status:false, msg:"Invalid aunthentication token"})
        }

        if (decodedToken) {

            req.userId = decodedToken.userId

            next();

        } else {
            return res.status(400).send({ status: false, message: "Invalid Token" })
        }

    } catch (error) {
        console.log(error)
        return res.status(500).send({ status: false, message: error.message })
    }
}

module.exports.auth = auth