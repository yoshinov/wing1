const mongoose              = require('mongoose');
const Schema                = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const termSchema = new Schema({
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