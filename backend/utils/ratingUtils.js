const mongoose = require('mongoose');
const Customer = require('../models/Customer');
const TyreStock = require('../models/TyreStock');
const Dealer = require('../models/Dealer');

const updateAverageRating = async (id, modelName) => {
    const Model = mongoose.model(modelName);

    try {
        const customers = await Customer.find({
            'orderHistory': {
                $elemMatch: {
                    $or: [
                        { dealerId: id },
                        { tyreId: id }
                    ]
                }
            }
        });

        const ratings = customers.flatMap(customer =>
            customer.orderHistory
                .filter(order => 
                    (order.dealerId && order.dealerId.toString() === id.toString()) ||
                    (order.tyreId && order.tyreId.toString() === id.toString())
                )
                .map(order => order.orderDealerRating || order.orderTyreRating)
                .filter(rating => rating > 0)
        );

        const averageRating = ratings.length > 0 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length) : 0;

        const roundedAverageRating = parseFloat(averageRating.toFixed(2));

        await Model.findByIdAndUpdate(id, { averageRating: roundedAverageRating });
    } catch (err) {
        console.error(`Error updating average rating for ${modelName} with ID ${id}:`, err);
        throw new Error(`Failed to update average rating for ${modelName}`);
    }
};

const updateAllAverageRatings = async (dealerId, tyreId) => {
    try {
        if (dealerId) {
            await updateAverageRating(dealerId, 'dealer');
        }
        if (tyreId) {
            await updateAverageRating(tyreId, 'TyreStock');
        }
    } catch (err) {
        console.error('Error updating all average ratings:', err);
        throw new Error('Failed to update all average ratings');
    }
};

module.exports = {
    updateAverageRating,
    updateAllAverageRatings,
};