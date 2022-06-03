const productModel = require("../models/productModel")
const { uploadFile } = require("../aws/aws.js")
const mongoose = require('mongoose')
const validators = require("../validator/validator")

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

const isValidfiles = function (files) {
    if (files && files.length > 0)
        return true
}

const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

const createProduct = async (req, res) => {

    try {

        const data = req.body

        const { title, description, currencyId, price, currencyFormat, isFreeShipping, style, availableSizes, installments } = data

        const files = req.files
        //===============================================VALIDATIONS=====================================================================================

        if (!isValidfiles(files)) {
            return res.status(400).send({ status: false, message: "Please Provide Profile Pictures" })
        }

        if (!validators.isValidRequestBody(data)) {

            return res.status(400).send({ status: false, message: "Please Provide DATA" })
        }

        //================================================TITLE VALIDATION====================================================================================

        if (!validators.isValidField(title)) {

            return res.status(400).send({ status: false, message: "Provde title field" })
        }
        //================================================DESCRIPTION VALIDATION====================================================================================


        if (!validators.isValidField(description)) {

            return res.status(400).send({ status: false, message: "Provide Description field" })
        }

        //================================================CURRENCYID VALIDATION====================================================================================


        if (!validators.isValidField(currencyId)) {

            return res.status(400).send({ status: false, message: "Provide currencyId field" })
        }

        //================================================PRICE VALIDATION====================================================================================


        if (!validators.isValidField(price)) {

            return res.status(400).send({ status: false, message: "Provide price field" })
        }

        //================================================CUR FORMAT VALIDATION====================================================================================


        if (!validators.isValidField(currencyFormat)) {

            return res.status(400).send({ status: false, message: "Provide currencyFormat field" })
        }

        //================================================FREESHIPPING VALIDATION====================================================================================


        if (!validators.isValidField(isFreeShipping)) {

            return res.status(400).send({ status: false, message: "provide isFreeShipping field " })
        }
        //================================================STYLE VALIDATION====================================================================================


        if (!validators.isValidField(style)) {

            return res.status(400).send({ status: false, message: "Provide style field" })
        }

        //================================================SIZE VALIDATION====================================================================================


        if (!validators.isValidField(availableSizes)) {

            return res.status(400).send({ status: false, message: "Provide availableSizes field" })
        }

        //================================================INSTALLMENT VALIDATION====================================================================================


        if (!validators.isValidField(installments)) {

            return res.status(400).send({ status: false, message: "Provide installments field" })
        }

        //================================================CUR-ID VALIDATION====================================================================================



        if (!(currencyId == "INR")) {

            return res.status(400).send({ status: false, message: "Currency should be INR" })
        }

        //================================================CUR-FORMAT VALIDATION====================================================================================

        if (!(currencyFormat == "₹")) {

            return res.status(400).send({ status: false, message: "CurrencyFormat Should be ₹" })
        }

        const isTitlePresent = await productModel.findOne({ title: title });

        //================================================UNIQUE TITLE VALIDATION====================================================================================


        if (isTitlePresent) {

            return res.status(400).send({ status: false, message: `${title} is already present` })

        }

        //================================================SIZE VALIDATION====================================================================================


        if (availableSizes) {
            if (availableSizes.length == 0) {
                return res.status(400).send({ status: false, message: "Provide Required Size" })
            }
        }

        let newAvailableSizes = []

        for (let i = 0; i < availableSizes.length; i++) {
            newAvailableSizes.push(availableSizes[i].toUpperCase().split(","))
            if (!["S", "XS", "M", "X", "L", "XXL", "XL"].includes(availableSizes[i])) {
                return res.status(400).send({ status: false, message: `Please provide size details in this form ${newAvailableSizes}` })
            }
        }

//================================================SET DATA====================================================================================


        const profilePicture = await uploadFile(files[0])

        const productData = {
            title,
            description,
            currencyId: currencyId,
            price,
            currencyFormat: currencyFormat,
            isFreeShipping,
            style,
            installments,
            productImage: profilePicture,
            availableSizes
        }

    //================================================CREATE DATA====================================================================================


        const newProductData = await productModel.create(productData)

        return res.status(201).send({
            status: true,
            message: "Product created",
            data: newProductData
        })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}




/////////////////////////////////////////////////////DELETE-PRODUCT-BY-ID-////////////////////////////////////////////////
const getproduct = async (req, res) => {
    try {
        const queryParams = req.query
        let { title, size ,priceSort  } = queryParams
        if (!isValidRequestBody(queryParams)) {
            // return all products that are not deleted and sort them in ascending
            let products = await productModel.find({ isDeleted: false }).sort({ "price": 1 })
            return res.status(200).send({ status: true, msg: 'all book list', data: products })
        }



        if (!(queryParams.size || queryParams.name || priceSort || queryParams.priceLessThan || queryParams.priceGreaterThan)) {
            return res.status(400).send({ status: false, msg: "query param detaile is required" })
        }

        let filter = { "isDeleted": false }

        if (queryParams.size ) filter.availableSizes = queryParams.size 
        if (queryParams.name  ) filter.title = queryParams.name
        if (queryParams.priceGreaterThan != null && queryParams.priceLessThan != null ) filter.price = { '$gt': queryParams.priceGreaterThan, "$lt": queryParams.priceLessThan }
        if (queryParams.priceGreaterThan != null && queryParams.priceLessThan == null) filter.price = { $gt: queryParams.priceGreaterThan }
        if (queryParams.priceLessThan != null && queryParams.priceGreaterThan == null) filter.price = { $lt: queryParams.priceLessThan }
        //if (priceSort) filter.price = {$sort:priceSort}

console.log(filter)
        const product = await productModel.find(filter)



        if (product.length) {
            return res.status(400).send({ status: true, count: product.length, msg: "product list", data: product })
        } else {
            return res.status(400).send({ status: false, msg: "No product found" })
        }


    } catch (error) {
        console.log(error)
        return res.status(500).send({ status: false, msg: error.message })

    }
}





///////////////////////////////////////////////////UPDATE PRODUCT/////////////////////////////////////////////////////////////////////////////////

const updateProduct = async (req, res) => {
    try {

        const data = JSON.parse(req.body.data)
        let ID = req.params.productId
        const files = req.files
        if (!(isValidRequestBody(data))) {
            return res.status(400).send({ status: false, msg: "please enter data to update" })
        }
//================================================VALIDATION====================================================================================


        if (!Object.keys(ID).length) {
            return res.status(400).send({ status: false, msg: "please enter product ID to update" })
        }

        const { title, description, currencyId, price, currencyFormat, isFreeShipping, style, availableSizes, installments } = data

        const findproduct = await productModel.findOne({ _id: ID }, { isDeleted: false })
        if (!findproduct) {
            return res.status(404).send({ status: false, msg: "Product not found or might be Deleted" })
        }

        const UniqueTitle = await productModel.findOne({ title: title })
        if (UniqueTitle) {
            return res.status(400).send({ status: false, msg: "This title already exist please try something unique" })
        }


        if (!(currencyId == "INR")) {

            return res.status(400).send({ status: false, message: "Currency should be INR" })
        }

        if (!(currencyFormat == "₹")) {

            return res.status(400).send({ status: false, message: "CurrencyFormat Should be ₹" })
        }
//================================================SIZE VALIDATION====================================================================================


        let newAvailableSizes = []

        for (let i = 0; i < availableSizes.length; i++) {
            newAvailableSizes.push(availableSizes[i].toUpperCase().split(","))
            if (!["S", "XS", "M", "X", "L", "XXL", "XL"].includes(availableSizes[i])) {
                return res.status(400).send({ status: false, message: `Please provide size details in this form ${newAvailableSizes}` })
            }
        }

        const productImage = await uploadFile(files[0])

        let updateproduct = await productModel.findByIdAndUpdate({ _id: ID }, {
            title: title, description: description,
            currencyId: currencyId, price: price, currencyFormat: currencyFormat,
            isFreeShipping: isFreeShipping, productImage: productImage, style: style, availableSizes: availableSizes, installments: installments
        }, { new: true })
        return res.status(200).send({ status: false, msg: "Product Update Successfully", data: updateproduct })


    } catch (error) {
        console.log(error)
        return res.status(500).send({ status: false, msg: error.message })
    }

}


/////////////////////////////////////////////////////////DELETE PRODUCT////////////////////////////////////////////////////////////////////////////////

const deleteProductById = async function (req, res) {

    try {
        let productId = req.params.productId

        if (!validators.isValidField(productId)) {

            res.status(400).send({ status: false, message: "productId must pe present" })
        }

        if (!mongoose.isValidObjectId(productId)) {

            res.status(400).send({ status: false, message: "productId must be valid" })
        }
        let deleteProduct = await productModel.findById({ _id: productId, isDeleted: false })

        if (!deleteProduct) {
            res.status(400).send({ status: false, message: "Product is already deleted" })
        }

        const result = await productModel.findOneAndUpdate({ _id: productId, isDeleted: false }, {
            isDeleted: true,
            deletedAt: new Date()
        }, { new: true })

        res.status(200).send({ status: true, msg: "Successfully updated", data: result })
    } catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
}

/////////////////////////////////////////////////////GET-PRODUCT-BY-ID-////////////////////////////////////////////////

const getProductByID = async (req, res) => {
    try {
        let productID = req.params.productId

        if (!productID || productID.trim().length === 0) {
            return res.status(400).send({ status: false, message: "product Id must be present " })
        }


        let findProduct = await productModel.findOne({ _id: productID })

        if (!findProduct) {
            return res.status(404).send({ status: false, message: "No product with this id exists" })
        }

        if (findProduct.isDeleted) {
            return res.status(404).send({ status: false, message: "This product does not exists anymore" })
        } else {
            return res.status(200).send({ status: true, message: "success", data: findProduct })
        }

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}





module.exports.createProduct = createProduct
module.exports.deleteProductById = deleteProductById
module.exports.getProductByID = getProductByID
module.exports.getproduct = getproduct
module.exports.updateProduct = updateProduct