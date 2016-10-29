const mongoose              = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const termSchema = new mongoose.Schema({
    tid: String,
    pw: String,
    shop: String,
    homeURL: String,
    commentURL: String
});

termSchema.plugin(passportLocalMongoose, {
    usernameField: "tid",
    passwordField: "pw"
});

module.exports = mongoose.model('Terminal', termSchema);