const mongoose              = require('mongoose');
const Schema                = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');
const findOrCreate          = require('mongoose-findorcreate');

const Code = new Schema({
    serial: {
        type: String,
        unique: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    history: [{
        _id: false,
        event: String,
        tid: {
            type: String,
            ref: "Terminal"
        },
        mt: Date,
        info: String,
        ip: String,
        vsr: String
    }],
    tickets: [{
        _id: false,
        title: String,
        start: Date,
        end: Date,
        coupon: Number,
        value: Number
    }]
}, {timestamps: true});

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
    twitter: String,
    message: String
}, {timestamps: true});

User.plugin(passportLocalMongoose, {
    usernameField: "email",
    passwordField: "pw"
});
User.plugin(findOrCreate);

exports.user = mongoose.model('User', User);
exports.code = mongoose.model('Code', Code);