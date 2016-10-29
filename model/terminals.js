const mongoose              = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const termSchema = new mongoose.Schema({
    _id: String,
    pw: String,
    name: String,
    homeURL: String,
    commentURL: String
});

termSchema.plugin(passportLocalMongoose, {
    usernameField: "_id",
    passwordField: "pw"
});

module.exports = mongoose.model('Terminal', termSchema);