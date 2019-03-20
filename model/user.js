
const mongoose = require("mongoose");

var userSchema = new mongoose.Schema({
    "username": String,
    "password": String,
});


userSchema.methods.verifyPassword = function(password) {
    if(this.password == password) {
        return true;
    }
    return false;
}

var User = mongoose.model('User', userSchema);


module.exports = User;
