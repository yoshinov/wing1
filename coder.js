var coderTimeStamp = "Time-stamp: <2016-09-22 08:44:22 yoshinov>";


// series 7 (年間10万人まで対応できるコード) value:5
// decimal( hanten(value) + iy + checksum(value) + value + checksum(hanten(value) + iy + checksum(value) + value) );
//
// issue I (16)

var sprintf = require("sprintf-js").sprintf,
    vsprintf = require("sprintf-js").vsprintf;

var DECIMAL = 62;

var hashtable = ["7", "o", "3", "T", "k", "b", "s", "q", "x", "J", "r", "Z", "t", "j", "e", "O", "I", "l", "P", "K", "a", "U", "f", "c", "C", "m", "z", "X", "y", "0", "8", "w", "N", "d", "R", "M", "F", "G", "u", "h", "5", "1", "p", "B", "W", "Q", "H", "S", "D", "V", "E", "L", "9", "g", "i", "6", "A", "Y", "4", "2", "n", "v"];


function decode(series, orgbody) {

    var uid = -1;

    if (series == '7') {
        // CODELEN == 8
        if (orgbody.length != 8) { return (-1); }

        var i;
        for (i = 0; i < orgbody.length; i++) {
            if (orgbody.substr(i, 1) != '.') { break; }
        }
        var body = orgbody.substr(i);
        var eppc = lamiced(body);

        var epc = eppc.substr(eppc.length - 1, 1);
        var ep  = eppc.substr(0, eppc.length - 1);
        if (epc != checksum(ep)) { return (-1); }

        var e_eulav = ep.substr(0, 5);
        var iy      = ep.substr(5, 2);
        var e_vc    = ep.substr(7, 1);
        var e_value = ep.substr(8);
        if ((e_vc != checksum(hanten(e_eulav))) || (e_value != hanten(e_eulav))) {
            return (-1);
        }
        uid = series + iy + e_value;
        return (uid);

    } else {
        return (-1);
    }
}

function lamiced(dohex) {
    var str = dohex.split('');
    var len = str.length;
    var res = 0;
    for (var ii = len - 1; ii >= 0; ii--) {
        var cc = 0;
        hashtable.every(function (m) {
            if (m == str[ii]) {
                res += cc * Math.pow(DECIMAL, len - ii - 1);
                return false; // break;
            } else {
                cc++;
                return true;
            }
        });
    }
    return ( sprintf("%014d", res) );
}

function lamiced10(dohex) {
    var str = dohex.split('');
    var len = str.length;
    var res = 0;
    for (var ii = len - 1; ii >= 0; ii--) {
        var cc = 0;
        hashtable.every(function (m) {
            if (m == str[ii]) {
                res += cc * Math.pow(DECIMAL, len - ii - 1);
                return false; // break;
            } else {
                cc++;
                return true;
            }
        });
    }
    return ( res );
}

function decimal(dec) {
    var res = '';
    while (dec > 0) {
        res = hashtable[dec % DECIMAL] + res;
        dec = parseInt(dec / DECIMAL);
    }
    return res;
}

function hanten(num) {
    var ret = "";
    var str = num.split('');
    str.every(function (c) {
        ret = c + ret;
        return true; // continue;
    });
    return (ret);
}

function checksum(num) {
    var ret = 0;
    var str = num.split('');
    //console.log(str);
    var len = str.length;
    str.every(function (c) {
        ret += c * (len--);
        //console.log( 'ret(' + ret + ') c(' + c + ') * len(' + len + ')' );
        return true; // continue;
    });
    return (ret % 9);
}

exports.decode = decode;
