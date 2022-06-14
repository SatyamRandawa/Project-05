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
const getproduct = async function (req, res) {
    try {
        let query = req.query
        if (!validation.validBody(query)) {

            const datafound = await productModel.find({ isDeleted: false })
            if (!datafound) {
                return res.status(404).send({ status: false, message: 'Product not exist' })
            }
            return res.status(200).send({ status: true, message: "Get Products details", data: datafound })

        } else {
            const { size, name, priceGreaterThan, priceLessThan } = query

            let filter = {}

            if (!(size || name || priceGreaterThan || priceLessThan)) {
                return res.status(400).send({ status: false, message: 'provide valid filter' })
            }
            if (size) {

                if (!(["S", "XS", "M", "X", "L", "XXL", "XL"].includes(size))) {
                    return res.status(400).send({ staus: false, message: "Pleage enter valid size" })
                }
                filter.availableSizes = size;
            }
            if (name) {
                if (!validation.isValid(name)) {
                    return res.status(400).send({ status: false, message: "Product name is required" })
                }
                filter.title = { $regex: name, $options: 'i' };
            }
            if (priceGreaterThan) {
                if (!validation.isValid(priceGreaterThan)) {
                    return res.status(400).send({ status: false, message: "priceGreaterThan is required" })
                }
                if (!/^[0-9]*$/.test(priceGreaterThan)) {
                    return res.status(400).send({ status: false, message: "please enter number value" })
                }
                filter.price = { $gt: priceGreaterThan };
            }
            if (priceLessThan) {
                if (!validation.isValid(priceLessThan)) {
                    return res.status(400).send({ status: false, message: "priceLessThan is required" })
                }
                if (!/^[0-9]*$/.test(priceLessThan)) {
                    return res.status(400).send({ status: false, message: "please enter number value" })
                }
                filter.price = { $lt: priceLessThan };
            }
            const getdata = await productModel.find({ $and: [{ isDeleted: false }, filter] }).sort({ "price": 1 })
            if (getdata.length > 0) {
                return res.status(200).send({ staus: true,message:"Success", data: getdata })
            } else {
                return res.status(404).send({ status: false, message: 'Product not exist' })
            }
        }

    }
    catch (err) {
        return res.status(500).send({ status: false, error: err.message })
    }
}

/////////////////////////////////////////////////////////Update ById////////////////////////////////////////////////////////////////////

const updateProduct = async function (req, res) {
    try {
        let id = req.params.productId
        let data = req.body
        let files = req.files
        const { title, description, price, productImage, isFreeShipping, style, installments, availableSizes } = data
        if (!validation.validObjectId(id)) {
            return res.status(400).send({ status: false, message: "not a valid onjectId" })
        }
        let product = await productModel.findOne({ _id: id, isDeleted: false })
        if (!product) {
            return res.status(404).send({ status: false, message: "no product found with this id" })
        }
        if (!validation.validBody(data)) {
            return res.status(400).send({ status: false, message: "please provide data to update" })
        }
        if ((title && !validation.isValid(title)) || title == "") {
            return res.status(400).send({ status: false, message: "please enter title" })
        }
        let sameTitle = await productModel.findOne({ title })
        if (sameTitle) {
            return res.status(400).send({ status: false, message: " title is already used" })
        }

        if ((description && !validation.isValid(description)) || description == "") {
            return res.status(400).send({ status: false, message: "please enter description" })
        }
        if ((price && !validation.isValid(price)) || price == "") {
            return res.status(400).send({ status: false, message: "please enter price" })
        }
    
        if (price && (price < 0 || !/\d/.test(price))) {
            return res.status(400).send({ status: false, message: "enter Price" })
        }

        if (availableSizes &&  !validation.isValid(availableSizes) ||availableSizes == "") {
            return res.status(400).send({ status: false, message: "Add Sizes" })
        }

        if (availableSizes && ! /(S|XS|M|X|L|XXL|XL)$/.test(availableSizes)) {
            return res.status(400).send({ status: false, message: "Sizes only includes ['S', 'XS','M','X', 'L','XXL', 'XL']" })
        }

        if (installments && (!validation.isValid(installments)) || installments == "") {
            return res.status(400).send({ status: false, message: "please enter installments" })
        }
        if (style && (!validation.isValid(style) || !/\w/.test(style))) {
            return res.status(400).send({ status: false, message: "enter style" })
        }

        if (isFreeShipping && (!validation.isValid(isFreeShipping) || !/true|false/.test(isFreeShipping))) {
            return res.status(400).send({ status: false, message: "enter is FreeShipping" })
        }

        if (files && files.length > 0) {
            let uploadedFileURL = await validation.uploadFile(files[0])
            productImage = uploadedFileURL
        }

        let updateData = await productModel.findByIdAndUpdate({ _id: id }, data, { new: true })
        return res.status(200).send({ status: true, message: "successfully updates", data: updateData })
    }
    catch (err) {
        return res.status(500).send({ status: false, error: err.message })
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

        if (!deleteProduct.isDeleted==false) {
           return res.status(400).send({ status: false, message: "Product is already deleted" })
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


        let findProduct = await productModel.findOne({ _id: productID }, {isDeleted:false})

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