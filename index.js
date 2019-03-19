
const readline = require('readline');

const mongoose = require('mongoose');

const productManager = require('./productManager.js');

// *************************************************
//          MONGO
// *************************************************
mongoose.connect('mongodb://localhost:27017/test', {useNewUrlParser: true});

// *************************************************
//          EXPRESS
// *************************************************
const routes = require("./routes.js")


function askProduct() {

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question('i want product [id]\n', (answer) => {

        var match = answer.match(/^i want product \[(.*)\]$/);
        if(!match) {
            return console.log(`Invalid command: ${answer}`);
        }

        productManager.orderProductById(match[1],(err,successMessage) => {
            
            if(err) {
                console.log("ERR " + err);
                return;
            }

            console.log(successMessage);
        });
    
        rl.close();
    });
}

getAllProducts = function(callback) {

    productManager.loadProducts((products) => {

        products.forEach(function(product) {
            console.log(`${product.id} - ${product.name} / ${product.EUR_price} / ${product.orders_counter}`);
        });

        callback();
    });
};

// Test not found :
//orderProductById("b547845ca9edcd");

// Test found 
//orderProductById("b547845ca9edc");

console.log("Bienvenue. Voici les produits disponibles :");
    
getAllProducts(askProduct);

