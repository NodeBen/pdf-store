var products = require('./products.json');

var fs = require('fs');

function loadProducts(callback) {

    fs.open("./products.json",'r',(err,fd) => {
        fs.fstat(fd, function(err, stats) {
            
            if(err) {
                console.log(err);
                return;
            }

            var buffer = new Buffer(stats.size);
            
            fs.read(fd,buffer,0,stats.size,null,(err,byteReads, buffer) => {
            
                if(err) {
                    console.log(err);
                    return;
                }
                var json = buffer.toString();

                try {
                    var products = JSON.parse(json);
                } catch(e) {
                    console.log(e);
                    return;
                }

                callback(products);
            
            });
        });

        
    })

}

function saveProducts(products) {
    fs.writeFile('./products.json',JSON.stringify(products),(err) => {
        if(err) {
            return console.log(err);
        }
        console.log('Save Successul');
    });
}

function getAllProducts() {
    console.log("Bienvenue. Voici les produits disponibles :");
    loadProducts((products) => {
        products.forEach(function(product) {
            console.log(`${product.id} - ${product.name} / ${product.EUR_price} / ${product.orders_counter}`);
        });
    });
}

function orderProductById(id) {
    loadProducts((products) => {
        products.forEach(function(product,index) {
            if(product.id != id) {
                return;
            }
            product.orders_counter++;
            products[index] = product;
        });

        saveProducts(products);
    });
}

getAllProducts();

orderProductById("b547845ca9edc");


/*
fs.readFile("./products.json",(err,data) => {

    if(err) {
        throw err;
    }

    try {
        var products = JSON.parse(data.toString());
    } catch(e) {
        throw e;
    }

    console.log(products[0]);
});
*/