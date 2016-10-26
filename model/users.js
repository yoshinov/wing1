const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

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
        tid: String,
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
}, {
    collection: "code",
    timestamps: true
});

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
}, {
    collection: "user",
    timestamps: true
});

exports.user = mongoose.model('User', User);
exports.code = mongoose.model('Code', Code);