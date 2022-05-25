const jwt = require("jsonwebtoken");

const auth = async function(req, res, next) {
    try {
        let bearer = req.headers['x-auth-key']
        if (!bearer) {
            return res.status(400).send({ status: false, message: "Token is required" })
        }
        const splitToken = bearer.split(" ");

        const token = splitToken[1]

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