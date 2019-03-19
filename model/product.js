
const mongoose = require("mongoose");

var productSchema = new mongoose.Schema({
    "id": String,
    "name": String,
    "description": String,
    "USD_price": Number,
    "EUR_price": Number,
    "file_link": String,
    "creation_date": Date,
    "orders_counter": Number
});
var Product = mongoose.model('Product', productSchema);

module.exports = Product;
