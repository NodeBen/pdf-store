var path = require('path');
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const stripe = require('stripe')('sk_test_SeuHn4WwG24hZiu4Xago1HzK00BHpBPB2g');

const helmet = require('helmet');
const expressSession = require('express-session');
const FileStore = require('session-file-store')(expressSession);

const methodOverride = require('method-override');
const restify = require('express-restify-mongoose')
const router = express.Router();
const mongoose = require("mongoose");

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
app.use(helmet());
app.use(expressSession({
    store: new FileStore({}),
    secret: 'keyboard cat', 
    resave: true, 
    saveUninitialized: true })); 

app.use( bodyParser.urlencoded({ extended: true }));

app.use(methodOverride())

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));

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
passport.use(new FacebookStrategy({
        clientID: '359928228195724',
        clientSecret: 'ecd939fa15e1536d6b572fab2fa5d4ab',
        callbackURL: "http://localhost:8080/auth/facebook/callback"
    },
    async function(accessToken, refreshToken, profile, cb) {

        try {
            
            var user = await User.findOne({ facebookId: profile.id });
        
            if(!user) {
                var user = new User();
                user.username = profile.displayName;
                user.password = null;
                user.facebookId = profile.id;
                await user.save();
            }
            
            cb(null,user);

        } catch(e) {
            cb(e, null);
        }
    }
));
passport.use(new GoogleStrategy({
        clientID: "844109183659-d8p5i028nerj2vo3on406u9mbtif6c1h.apps.googleusercontent.com",
        clientSecret: "H_FUU4OjDa5b1p5Kfvwxij6S",
        callbackURL: "http://localhost:8080/auth/google/callback"
    },
    async function(token, tokenSecret, profile, done) {
        try {
                
            var user = await User.findOne({ googleId: profile.id });

            if(!user) {
                var user = new User();
                user.username = profile.displayName;
                user.password = null;
                user.googleId = profile.id;
                await user.save();
            }
            
            done(null,user);

        } catch(e) {

            done(e, null);
        }
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
app.get('/', async function(req, res) {

    var products = await productManager.loadProducts();
    
    res.render('pages/index',{products, user: req.user});
    
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

// *************************
//      FACEBOOK CONNECT
// *************************
app.get('/auth/facebook',
  passport.authenticate('facebook'));

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });

// ******************************
//    GOOGLE CONNECT
// ******************************
app.get('/auth/google',
  passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login'] }));

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

  // *****************************
  //        ROUTES
  // *****************************
function authMiddleware (req, res, next) {

    if (req.isAuthenticated()) {
        return next()
    }
    
    res.status(401).send('Login Error');

}

app.get('/ajax/order', authMiddleware, function(req, res){

    productManager.orderProductById(req.user, req.param("id"))
    .then((data) => {

        let product = data.product;
        let output = data.successString; 

        var ret = {
            status: true,
            output,
            id: product.id
        }
        res.send(JSON.stringify(ret));
    
    }).catch((e) => {
    
        var ret = {
            status: false,
        }
        res.send(JSON.stringify(ret));
        return;
    
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

app.post('/charge', async function(req, res) {

    var productId = req.body.product_id;

    var token = req.body.stripeToken;
    var tokenType = req.body.stripeTokenType;
    var email = req.body.stripeEmail;
    
    var product = await productManager.getProduct(productId);

    if(!product) {
        res.send("Product not found");
        return;
    }

    stripe.customers.create({
        email: email
    }).then((customer) => {
        
        return stripe.customers.createSource(customer.id, {
          source: token
        });

    }).then((source) => {

        return stripe.charges.create({
          amount: product.EUR_price * 100,
          currency: 'eur',
          customer: source.customer
        });

    }).then((charge) => {

        return new Promise((resolve,reject) => {
            // here create the user
            var user = User.findOne({ username: email }, function(err,user) {
                resolve({charge,user});
            });
        });

    }).then((data) => {

        let charge = data.charge;

        function makeid(length) {
            var text = "";
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
          
            for (var i = 0; i < length; i++)
              text += possible.charAt(Math.floor(Math.random() * possible.length));
          
            return text;
        }

        var pwgen = null;
        if(!data.user) {

            pwgen = makeid(16);

            var user = new User();
            user.username = email;
            user.setPassword(pwgen);
            user.save();
        } else {
            user = data.user;
        }

        productManager.orderProductById(user, productId, (err,string) => {
            if(err) {
                console.log(err);
                return;
            }

            console.log(string);
        });

        res.render('pages/success', {product,user,pwgen});
        return;
    }).catch((err) => {
        // Deal with an error
        console.log('err');
        console.log(err)
        res.send('An Error occur ' + err);
    });

})

// *********************************************
//  REsTIFY
// *********************************************

restify.serve(router, Product);
  
app.use(router);

// ********************************************
//    START
// ********************************************

app.listen(8080);

console.log('8080 is the magic port');

