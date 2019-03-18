var products = require('./products.json');

var fs = require('fs');

var readline = require('readline');

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
    fs.writeFile('./products.json',JSON.stringify(products,null,4),(err) => {
        if(err) {
            return console.log(err);
        }
        console.log('Save Successul');
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

function orderProductById(id) {
    loadProducts((products) => {

        var wantedProduct;
        products.forEach(function(product,index) {

            // Skip
            if(product.id != id) {
                return;
            }
            wantedProduct = product;
            product.orders_counter++;
            products[index] = product;
        });

        if(!wantedProduct) {
            return console.log(`Product [${id}] not found`);
        }
        saveProducts(products); 

        console.log(`Commande terminée. voici votre fichier: ${wantedProduct.file_link}`)
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


getAllProducts(askProduct);

// Test not found :
//orderProductById("b547845ca9edcd");
// Test found 
//orderProductById("b547845ca9edc");

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