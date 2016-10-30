const mongoose              = require('mongoose');
const Schema                = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');
const findOrCreate          = require('mongoose-findorcreate');

const User = new Schema({
    name: {
        type: String,
        unique: true
    },
    email: {
        type: String,
        unique: true
    },
    pw: String,
    birthday: Date,
    language: String,
    postal: String,
    address: String,
    facebook: String,
    twitter: String
}, {timestamps: true});

User.plugin(passportLocalMongoose, {
    usernameField: "email",
    passwordField: "pw"
});
User.plugin(findOrCreate);

module.exports = mongoose.model('User', User);