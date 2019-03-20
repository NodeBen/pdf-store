
const mongoose = require("mongoose");

var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var orderSchema = new mongoose.Schema({
    "product": ObjectId,
    "user": ObjectId,
    "date": Date,
    "price": Number,
});



var Order = mongoose.model('Order', orderSchema);


module.exports = Order;
