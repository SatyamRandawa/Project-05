const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.type.ObjectId,
        ref: User,
        required: true,
        unique: true
    },

    items: [{
        productId: {
            type: mongoose.Schema.type.ObjectId,
            ref: Product,
            required: true
        },

        quantity: {
            type: Number,
            required: true,
            min: 1
        }
    }],

    totalPrices: {
        type: Number,
        required: true,
        comment: "Holds total price of all the items in the cart"
    },

    totalItems: {
        type: Number,
        required: true,
        comment: "Holds total number of items in the cart"
    },

}, { timestamps: true })

module.exports = mongoose.model('Cart', cartSchema)



// {
//     userId: { ObjectId, refs to User, mandatory, unique },
//     items: [{
//         productId: { ObjectId, refs to Product model, mandatory },
//         quantity: { number, mandatory, min 1 }
//     }],
//     totalPrice: { number, mandatory, comment: "Holds total price of all the items in the cart" },
//     totalItems: { number, mandatory, comment: "Holds total number of items in the cart" },
//     createdAt: { timestamp },
//     updatedAt: { timestamp },
// }   createdAt: { timestamp },
//     updatedAt: { timestamp },
// }