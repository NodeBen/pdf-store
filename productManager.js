
const mongoose = require("mongoose");

const Product = require("./model/product.js");


loadProducts = function(callback) {

        Product.find((err,products) => {
            callback(products);
        });

    };

    
orderProductById = function(id, outputCallback) {
        
    loadProducts((products) => {
        
        var wantedProduct;
        products.forEach(function(product,index) {

            // Skip
            if(product.id != id) {
                return;
            }
            wantedProduct = product;
            product.orders_counter++;
            
            product.save();

            products[index] = product;
        });

        if(!wantedProduct) {
            
            var errString = `Product [${id}] not found` 
            
            outputCallback(errString);
        }

        var successString = `Commande terminée. voici votre fichier: ${wantedProduct.file_link}`;
        
        outputCallback(null,successString,wantedProduct);
        
    });

}

exports.loadProducts = loadProducts;
exports.orderProductById = orderProductById;