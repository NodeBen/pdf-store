
const express = require('express');
const ejs = require('ejs');
const session = require('express-session');
const bodyParser = require('body-parser');

// ***************************************************
// 
// ***************************************************
const Product = require('./model/product.js');
const User = require('./model/user.js');
const productManager = require('./productManager.js');


var app = express();

var sess = {
    secret: 'keyboard cat',
    cookie: {}
}
app.use(session(sess))

app.use( bodyParser.json() ); 
app.use( bodyParser.urlencoded({ extended: false }));

app.set('view engine', 'ejs');

app.use(express.static('public'));

app.get('/', function(req, res) {

    productManager.loadProducts((products) => {
        res.render('pages/index',{products, is_auth: req.session.auth});
    });
    
});

app.get('/ajax/order', function(req, res){
    
    if(!req.session.auth) {    
        var ret = {
            status: false,
        }
        res.statusCode = 401;
        res.send(JSON.stringify(ret));
        return;
    }

    productManager.orderProductById(req.param("id"), (err,output,product) => {

        if(err) {

            var ret = {
                status: false,
            }
            res.send(JSON.stringify(ret));
            return;
        }

        var ret = {
            status: true,
            output,
            id: product.id
        }
        res.send(JSON.stringify(ret));
    });
    
    
});

app.get('/signup/login', function(req, res){
    
    res.render('pages/signup');

});
   
app.get('/signup/logout', function(req, res){
    
    req.session.auth = false;
    res.redirect('/', 302);

});

/**
 * Default Ajax Return structure
 */
function ajaxReturn(res,success,e) {
    
    var ret = {
        success,
        e
    }

    res.send(JSON.stringify(ret));
}

app.post('/signup/auth', function(req, res){

    try {

        if(!req.body.username) {
            throw 'Missing username';
        }

        if(!req.body.password) {
            throw 'Missing password';
        }

        User.findOne({username:req.body.username}, (err, user) => {

            try {

                if(err) {
                    throw err;
                }

                if(!user) {
                    throw 'User Not found';
                }

            } catch(e) {
                return ajaxReturn(res,false,e);
            }

            req.session.auth = true;

            return ajaxReturn(res,true,null);

        });

    // req.session.auth = 1;
    } catch(e) {
        return ajaxReturn(res,false,e);
    }
});

app.listen(8080);

console.log('8080 is the magic port');