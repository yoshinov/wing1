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
        terminal: {
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

module.exports = mongoose.model('Code', Code);