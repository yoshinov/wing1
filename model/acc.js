// access counter

var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var ccSchema = new Schema({
    cc: String,
    value: Number
}, {collection: "acc"});

module.exports = mongoose.model('acc', ccSchema);