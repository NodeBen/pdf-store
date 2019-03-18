var fs = require('fs');

var readline = require('readline');

const mongoose = require('mongoose');

var express = require('express');

var ejs = require('ejs');


// *************************************************
//          EXPRESS
// *************************************************
var app = express();

app.set('view engine', 'ejs');

app.use(express.static('public'));

app.get('/', function(req, res) {

    loadProducts((products) => {
        res.render('pages/index',{products});
    });
    
});

app.get('/ajax/order', function(req, res){
    
        
        var ret = {
            status: false,
        }
        res.send(JSON.stringify(ret));
   
    return;

    orderProductById(req.param("id"), (output) => {

        var ret = {
            status: true,
            output
        }
        res.send(JSON.stringify(ret));
    });
    
    
});

app.get('/signup/login', function(req, res){
    
    res.render('pages/signup');

});
   

app.listen(8080);

console.log('8080 is the magic port');




mongoose.connect('mongodb://localhost:27017/test', {useNewUrlParser: true});

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


var userSchema = new mongoose.Schema({
    "username": String,
    "password": String,
});

var User = mongoose.model('User', userSchema);


function loadProducts(callback) {

    Product.find((err,products) => {
        callback(products);
    });

}

function getAllProducts(callback) {
    
    console.log("Bienvenue. Voici les produits disponibles :");
    
    loadProducts((products) => {

        products.forEach(function(product) {
            console.log(`${product.id} - ${product.name} / ${product.EUR_price} / ${product.orders_counter}`);
        });

        callback();
    });
}

function orderProductById(id, outputCallback) {
    
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
            if(outputCallback) {
                outputCallback(errString);
            } else {
                return console.log(errString);
            }
        }

        var successString = `Commande terminée. voici votre fichier: ${wantedProduct.file_link}`;
        if(outputCallback) {
            outputCallback(successString);
        } else {
            console.log(successString);
        }
    });
}

function askProduct() {

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question('i want product [id]\n', (answer) => {

        answer.split('[');
        var match = answer.match(/^i want product \[(.*)\]$/);
        if(!match) {
            return console.log(`Invalid command: ${answer}`);
        }

        orderProductById(match[1]);
    
        rl.close();
    });
}

// Test not found :
//orderProductById("b547845ca9edcd");

// Test found 
//orderProductById("b547845ca9edc");

getAllProducts(askProduct);
