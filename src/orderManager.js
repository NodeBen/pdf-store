
const mongoose = require("mongoose");

const Product = require("./model/product.js");

const User = require("./model/user.js");

const Order = require("./model/order.js");

addOrder = function(user,product) {
    var order = new Order();
    order.user = user;
    order.product = product;
    order.date = new Date();
    order.price = product.EUR_price;
    order.save();
}

getUserProducts = async function(user) {
    
    if(!user) {
        throw "Missing user";
    }

    var orders = await Order.find({user: user._id}).populate('product');

    var products = [];
    orders.forEach((order) => {
        products.push(order.product);
    });
    
    return products;
}

exports.addOrder = addOrder;
exports.getUserProducts = getUserProducts;

