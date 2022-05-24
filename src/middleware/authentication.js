const jwt = require("jsonwebtoken");

const auth = async function(req, res, next) {
    try {
        let token = req.headers['x-auth-key'].split(" ")
        if (!token) {
            return res.status(400).send({ status: false, message: "Token is required" })
        }

        let decodedToken = jwt.verify(token, 'Uranium-Project-5-Group-29');

        if (decodedToken) {

            req.userId = decodedToken._id

            next();

        } else {
            return res.status(400).send({ status: false, message: "Invalid Token" })
        }

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

module.exports.auth = auth