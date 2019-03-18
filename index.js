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

function getAllProducts() {
    console.log("Bienvenue. Voici les produits disponibles :");
    loadProducts((products) => {
        products.forEach(function(product) {
            console.log(`${product.id} - ${product.name} / ${product.EUR_price} / ${product.orders_counter}`);
        });
    });
}

getAllProducts();

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