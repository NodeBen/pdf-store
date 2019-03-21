
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

var userSchema = new mongoose.Schema({
    "username": String,
    "password": String,
    "facebookId": String,
    "googleId": String,
});

userSchema.methods.setPassword = function(password) {
    this.password = bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
}

userSchema.methods.verifyPassword = function(password) {
    
    return bcrypt.compareSync(password, this.password);
    
}

userSchema.methods.upgradePassword = function() {
    if(!this.password) {
        return;
    }
    if(this.password && this.password.indexOf('$2b$') === 0) {
        return;
    }
    if(this.googleId) {
        return;
    }
    if(this.facebookId) {
        return;
    }
    this.setPassword(this.password);
    this.save();
}

var User = mongoose.model('User', userSchema);


module.exports = User;
