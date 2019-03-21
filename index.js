
const readline = require('readline');

const mongoose = require('mongoose');

const productManager = require('./productManager.js');

const User = require('./model/user.js');

// *************************************************
//          MONGO
// *************************************************
mongoose.connect('mongodb://localhost:27017/test', {useNewUrlParser: true});

// *************************************************
//          EXPRESS
// *************************************************
const routes = require("./routes.js")


function askProduct() {

    new Promise((resolve, reject) => {
    
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        rl.question('i want product [id]\n', (answer) => {
            rl.close();
            resolve(answer);
        });
    
    }).then(async (value) => {

        var match = value.match(/^i want product \[(.*)\]$/);
        if(!match) {
            throw `Invalid command: ${value}`;
        }
        
        // get a random user
        var user = await User.findOne();

        return productManager.orderProductById(user,match[1]);

    }).then((data) => {
    
        console.log(`Product Id : ${data.product.id}`);
        console.log(data.successString);

    }).catch((e) => {

        console.error(e);
    
    });
}

getAllProducts = async function() {

    return new Promise(async function(resolve,reject) {

        var products = await productManager.loadProducts();
        
        products.forEach(function(product) {
            console.log(`${product.id} - ${product.name} / ${product.EUR_price} / ${product.orders_counter}`);
        });
        resolve();
    });

};

// Test not found :
//orderProductById("b547845ca9edcd");

// Test found 
//orderProductById("b547845ca9edc");

console.log("Bienvenue. Voici les produits disponibles :");
    
getAllProducts()
.then(() => {
    askProduct();
});



