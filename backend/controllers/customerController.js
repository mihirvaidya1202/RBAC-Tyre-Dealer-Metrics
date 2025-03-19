const TyreStock = require('../models/TyreStock');
const Dealer = require('../models/Dealer');
const Customer = require('../models/Customer');
const { verifyToken } = require('../utils/jwt');
const { updateAverageRating, updateAllAverageRatings } = require('../utils/ratingUtils');

exports.getAllTyres = async (req, res) => {
    try {
        const dealers = await Dealer.find().populate({
            path: 'dealerStock.tyreStockId',
            model: 'TyreStock',
        });

        const availableTyresSet = new Set();

        dealers.forEach((dealer) => {
            if (dealer.dealerStock && dealer.dealerStock.length > 0) {
                dealer.dealerStock.forEach((stock) => {
                    if (stock.tyreStockId) {
                        availableTyresSet.add(stock.tyreStockId);
                    }
                });
            }
        });

        const availableTyres = Array.from(availableTyresSet);

        res.status(200).json(availableTyres);
    } catch (err) {
        console.error("Error fetching tyres:", err);
        res.status(500).json({ message: "Failed to fetch tyres", error: err.message });
    }
};

exports.getTyreDetails = async (req, res) => {
    try {
        const { tyreModel, tyreSize } = req.params;

        const tyre = await TyreStock.findOne({ tyreModel, tyreSize });

        if (!tyre) {
            return res.status(404).json({ message: "Tyre not found" });
        }

        const dealers = await Dealer.find({ "dealerStock.tyreStockId": tyre._id }).populate({
            path: "dealerStock.tyreStockId",
            match: { _id: tyre._id },
        });

        const dealerStockDetails = dealers.map((dealer) => {
            const stockItem = dealer.dealerStock.find((stock) => 
                stock.tyreStockId?._id.toString() === tyre._id.toString()
            );

            return {
                dealerId: dealer?._id,
                dealerName: dealer?.username,
                quantity: stockItem ? stockItem.quantity : 0,
                averageRating: dealer?.averageRating
            };
        });

        res.status(200).json({
            tyre: {
                _id: tyre._id,
                tyreModel: tyre.tyreModel,
                tyreSize: tyre.tyreSize,
                price: tyre.price,
            },
            dealerStockDetails,
        });
    } catch (err) {
        console.error("Error fetching tyre details:", err);
        res.status(500).json({ message: "Failed to fetch tyre details", error: err.message });
    }
};

exports.buyTyre = async (req, res) => {
    try {
        const { dealerId, tyreId, quantity } = req.body;

        const userId = req.user._id;

        const dealer = await Dealer.findById(dealerId);
        if (!dealer) {
            return res.status(404).json({ message: "Dealer not found" });
        }

        const stockItem = dealer.dealerStock.find(
            (stock) => stock.tyreStockId.toString() === tyreId
        );

        if (!stockItem) {
            return res.status(404).json({ message: "Tyre not found in dealer stock" });
        }

        if (stockItem.quantity < quantity) {
            return res.status(400).json({ message: "Insufficient stock" });
        }

        stockItem.quantity -= quantity;
        await dealer.save();

        const customer = await Customer.findById(userId);
        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }

        customer.orderHistory.push({
            tyreId,
            dealerId,
            quantity,
            purchaseDate: new Date(),
        });
        await customer.save();

        res.status(200).json({ message: "Tyre purchased successfully", customer });
    } catch (err) {
        console.error("Error purchasing tyre:", err);
        res.status(500).json({ message: "Failed to purchase tyre", error: err.message });
    }
};

exports.getPurchaseHistory = async (req, res) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    try {
        const decoded = verifyToken(token);
        const userId = decoded.id;

        const customer = await Customer.findById(userId)
            .populate('orderHistory.tyreId')
            .populate('orderHistory.dealerId');

        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }

        const sortedOrderHistory = customer.orderHistory.sort(
            (a, b) => b.purchaseDate - a.purchaseDate
        );

        res.status(200).json(sortedOrderHistory);
    } catch (err) {
        console.error("Error fetching purchase history:", err);
        res.status(500).json({ message: "Failed to fetch purchase history", error: err.message });
    }
};

exports.updateDealerRating = async (req, res) => {
    const { orderId, dealerRating } = req.body;

    const userId = req.user._id;

    try {
        const customer = await Customer.findById(userId);
        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }

        const order = customer.orderHistory.id(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        order.orderDealerRating = dealerRating;
        await customer.save();

        await updateAverageRating(order.dealerId, 'dealer');

        res.status(200).json({ message: "Dealer rating updated successfully", order });
    } catch (err) {
        console.error("Error updating dealer rating:", err);
        res.status(500).json({ message: "Failed to update dealer rating", error: err.message });
    }
};

exports.updateTyreRating = async (req, res) => {
    const { orderId, tyreRating } = req.body;

    const userId = req.user._id;

    try {
        const customer = await Customer.findById(userId);
        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }

        const order = customer.orderHistory.id(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        order.orderTyreRating = tyreRating;
        await customer.save();

        await updateAverageRating(order.tyreId, 'TyreStock');

        res.status(200).json({ message: "Tyre rating updated successfully", order });
    } catch (err) {
        console.error("Error updating tyre rating:", err);
        res.status(500).json({ message: "Failed to update tyre rating", error: err.message });
    }
};