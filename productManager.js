
const mongoose = require("mongoose");

const Product = require("./model/product.js");

const OrderManager = require("./orderManager.js");

loadProducts = function() {

    return new Promise(function(resolve,reject) {
        Product.find((err,products) => {
            if(err) {
               return reject(err);
            }
            resolve(products);
        });
    });
}
        
    

async function getProduct(id) {

    var products = await Product.find();
    
    var wantedProduct;

    await products.forEach(function(product,index) {
        // Skip
        if(product.id != id) {
            return;
        }
        wantedProduct = product;
    });
    
    return wantedProduct;
}   

orderProductById = function(user, id) {
    
    if(!id) {
        throw "Empty id";
    }

    return loadProducts().
        then(async (products) => {
        
            var product = await getProduct(id);
            if(!product) {
                
                var errString = `Product [${id}] not found` 
                throw errString;
            }

            product.orders_counter++;

            await product.save();

            await OrderManager.addOrder(user, product);

            var successString = `Commande terminée. voici votre fichier: ${product.file_link}`;
            
            return {successString,product};
        });
    
}

exports.loadProducts = loadProducts;
exports.orderProductById = orderProductById;
exports.getProduct = getProduct;
