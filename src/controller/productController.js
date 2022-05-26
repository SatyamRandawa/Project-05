const productModel = require("../models/productModel")
const uploadFile = require("../aws/aws.js")
const jwt = require("jsonwebtoken")
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')

const validators = require("../validator/validator")

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

const isValidfiles = function(files) {
    if (files && files.length > 0)
        return true
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

const createProduct = async function(req, res) {

    try {

        const data = JSON.parse(req.body.data)

        const { title, description, currencyId, price, currencyFormat, isFreeShipping, style, availableSizes, installments } = data

        const files = req.files

        if (!isValidfiles(files)) {
            return res.status(400).send({ status: false, message: "Please Provide Profile Pictures" })
        }

        if (!validators.isValidRequestBody(data)) {

            return res.status(400).send({ status: false, message: "Please Provide DATA" })
        }

        if (!validators.isValidField(title)) {

            return res.status(400).send({ status: false, message: "Provde title field" })
        }

        if (!validators.isValidField(description)) {

            return res.status(400).send({ status: false, message: "Provide Description field" })
        }

        if (!validators.isValidField(currencyId)) {

            return res.status(400).send({ status: false, message: "Provide currencyId field" })
        }

        if (!validators.isValidField(price)) {

            return res.status(400).send({ status: false, message: "Provide price field" })
        }

        if (!validators.isValidField(currencyFormat)) {

            return res.status(400).send({ status: false, message: "Provide currencyFormat field" })
        }

        if (!validators.isValidField(isFreeShipping)) {

            return res.status(400).send({ status: false, message: "provide isFreeShipping field " })
        }

        if (!validators.isValidField(style)) {

            return res.status(400).send({ status: false, message: "Provide style field" })
        }

        if (!validators.isValidField(availableSizes)) {

            return res.status(400).send({ status: false, message: "Provide availableSizes field" })
        }

        if (!validators.isValidField(installments)) {

            return res.status(400).send({ status: false, message: "Provide installments field" })
        }


        if (!(currencyId = INR)) {

            return res.status(400).send({ status: false, message: "Currency should be INR" })
        }

        if (!(currencyFormat = "₹")) {

            return res.status(400).send({ status: false, message: "CurrencyFormat Should be ₹" })
        }

        const isTitlePresent = await productModel.findOne({ title: title });

        if (isTitlePresent) {

            return res.status(400).send({ status: false, message: `${title} is already present` })

        }

        if (availableSizes) {
            if (availableSizes.length == 0) {
                return res.status(400).send({ status: false, message: "Provide Required Size" })
            }
        }
        let newAvailableSizes = []

        for (let i = 0; i < availableSizes.length; i++) {
            newAvailableSizes.push(availableSizes[i].toUppercase().split(","))
            if (!["S", "XS", "M", "X", "L", "XXL", "XL"].includes(availableSizes[i])) {
                return res.status(400).send({ status: false, message: `Please provide size details in this form ${newAvailableSizes}` })
            }
        }

        const profilePicture = await uploadFile(files[0])

        const productData = {
            title: title,
            description: description,
            currencyId: currencyId,
            price: price,
            currencyFormat: currencyFormat,
            isFreeShipping: isFreeShipping,
            style: style,
            installments: installments,
            productImage: profilePicture,
            availableSizes: newAvailableSizes
        }

        const newProductData = await productModel.create(productData)

        return res.status(201).send({
            status: false,
            message: "Product created",
            data: newProductData
        })
    } catch (error) {
        console.log(error)
        return res.status(500).send({ status: false, msg: error.message })
    }
}

module.exports.createProduct = createProduct