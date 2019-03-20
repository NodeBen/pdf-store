
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const expressSession = require('express-session');
const FileStore = require('session-file-store')(expressSession);

// ***************************************************
//  LOAD MODELS
// ***************************************************
const Product = require('./model/product.js');
const User = require('./model/user.js');
const Order = require('./model/order.js');
const productManager = require('./productManager.js');
const OrderManager = require('./orderManager.js');

// ***************************************************
//      EXPRESS
// ***************************************************
var app = express();

app.use(require('cookie-parser')());

app.use(expressSession({
    store: new FileStore({}),
    secret: 'keyboard cat', 
    resave: true, 
    saveUninitialized: true })); 

app.use( bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

app.use(express.static('public'));

app.use(passport.initialize());
app.use(passport.session());

// **********************************************
//      PASSPORT
// **********************************************
passport.use(new LocalStrategy(
    
    function(username, password, done) {
        
        User.findOne({ username: username }, function (err, user) {
            
            if (err) { 
                return done(err); 
            }
            
            if (!user) { 
                return done(null, false, { message: 'Invalid username.' }); 
            }

            if (!user.verifyPassword(password)) { 
                return done(null, false, { message: 'Invalid password.' }); 
            }
            
            return done(null, user);
        });

    }
));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});

// *************************************************
//      ROUTES
// *************************************************
app.get('/', function(req, res) {

    productManager.loadProducts((products) => {
        res.render('pages/index',{products, is_auth: req.user});
    });
    
});


app.post('/signup/auth',function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
        
        if (err) { 
            return next(err); 
        }
        
        if (!user) { 
            return ajaxReturn(res,false,info.message);
        }
        
        req.logIn(user, function(err) {
          if (err) { 
              return next(err); 
          }
          return ajaxReturn(res,true, null);
        });

    })(req,res,next);
});

function authMiddleware (req, res, next) {

    if (req.isAuthenticated()) {
        return next()
    }
    
    res.status(401).send('Login Error');

}

app.get('/ajax/order', authMiddleware, function(req, res){

    productManager.orderProductById(req.user, req.param("id"), (err,output,product) => {

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
    
    req.logout();

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


app.get('/getUserOrders', authMiddleware, function(req, res){

    new Promise(function(resolve, reject) {
    
        Order.find({user: req.user},(err,products) => {
                
            if(err) {
                reject('Failed to find orders');
            }
        
            resolve(products);

        });

    }).then((products) => {

            res.send(JSON.stringify(products));

    }).catch((err) => {

            ajaxReturn(res,false,err);
    });
    
});

app.get('/getUserProducts', authMiddleware, async function(req, res){

    try {

        var products = await OrderManager.getUserProducts(req.user);

        res.send(JSON.stringify(products));
        
        return;

    } catch(e) {console.log(e);
        return ajaxReturn(res,false,e);
    }
    
});

app.listen(8080);

console.log('8080 is the magic port');