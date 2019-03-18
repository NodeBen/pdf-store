var products = require('./products.json');

var fs = require('fs');


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

            console.log(products[1]);
        
        });
    });

    
})
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