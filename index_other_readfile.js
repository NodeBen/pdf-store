
var products = require('./products.json');

console.log(products[0]);

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
