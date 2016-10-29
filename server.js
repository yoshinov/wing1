// default get access handler
var serverTimeStamp = 'Time-stamp: <2016-10-26 11:11:21 yoshinov>';

'use strict';

const port      = 80;
const ORGANIZER = '48v研究会';
const CSS_DIR   = '/home/yoshinov/css/';

// サーバー実装の前に、エラーハンドリングを記載します。
process.on('uncaughtException', function (err) {console.log(err);});

const express      = require('express');
const app          = express();
const path         = require('path');
const bodyParser   = require('body-parser');
const session      = require('express-session');
const logger       = require('morgan');
const MongoStore   = require('connect-mongo')(session);
const moment       = require('moment');
const mongoose     = require('mongoose');
const sync         = require('./sync');
const acc          = require('./model/acc');
const userPassport = require('./auth').user;
const termPassport = require('./auth').term;

mongoose.connect('mongodb://localhost/wings');

app.set('view engine', 'jade');
app.set('views', __dirname + '/views');

//app.use(logger('dev'));
app.use(logger('default'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// session使うための記述
app.use(session({
    secret: 'wingsnov',
    saveUninitialized: true,
    resave: false,
    store: new MongoStore({mongooseConnection: mongoose.connection})
}));

app.all('/user*', userPassport.initialize());
app.all('/user*', userPassport.session());
app.all('/term*', termPassport.initialize());
app.all('/term*', termPassport.session());

// routing
/**
 * term
 **/
app.get('/term', function (req, res) {
    res.render('term', {term: req.user});
});

app.get('/term/register', function (req, res) {
    res.render('termReg', {});
});
app.post('/term/register', termPassport.authenticate('terminal-signup', {
    successRedirect: '/term',
    failureRedirect: '/term/register'
}));

app.get('/term/login', function (req, res) {
    res.render('termLogin', {term: req.term});
});
app.post('/term/login', termPassport.authenticate('terminal-login', {
    successRedirect: '/term',
    failureRedirect: '/term/login'
}));

app.get('/term/logout', function (req, res) {
    req.logout();
    res.redirect('/term');
});

/**
 * user
 */
app.get('/user', function (req, res) {
    res.render('user', {user: req.user});
});

app.get('/user/register', function (req, res) {
    res.render('register', {});
});
app.post('/user/register', userPassport.authenticate('local-signup', {
    successRedirect: '/user',
    failureRedirect: '/register'
}));

app.get('/user/login', function (req, res) {
    res.render('login', {user: req.user});
});
app.post('/user/login', userPassport.authenticate('local-login', {
    successRedirect: '/user',
    failureRedirect: '/login'
}));

app.get('/user/logout', function (req, res) {
    req.logout();
    res.redirect('/user');
});

app.get('/auth/twitter', userPassport.authenticate('twitter'));
app.get('/auth/twitter/callback', userPassport.authenticate('twitter', {
    successRedirect: '/',
    failureRedirect: '/login'
}));

app.get('/auth/facebook', userPassport.authenticate('facebook'));
app.get('/auth/facebook/callback', userPassport.authenticate('facebook', {
    successRedirect: '/',
    failureRedirect: '/login'
}));

app.post('/pull', sync.pull);
app.post('/push', sync.push);

//
// 以下，サイト共通
//

// CSS file対応
app.get('/css/:file', function (req, res) {
    res.sendFile(CSS_DIR + req.params.file);
});

// 2016/8/6 vpn 証明書に対応する
// /usr/local/certbot/certbot-auto renew --force-renew --webroot -w /home/yoshinov/vpn
//  http://48v.me/.well-known/ にアクセスがあったとき，それ以下の文字列をファイル名とみなして中身をテキストとして返送する
app.get('/.well-known/acme-challenge/:file', function (req, res) {
    //res.send('hello ' + req.params.file);
    res.sendFile('/home/yoshinov/vpn/.well-known/acme-challenge/' + req.params.file);
});


// default root
app.get('/', function (req, res) {
    acc.update({cc: 'ac2'}, {$inc: {value: 0}}, {upsert: true}, function (err) {
        acc.update({cc: 'ac1'}, {$inc: {value: 1}}, {upsert: true}, function (err) {
            var str = '?/?';
            if (err) {
                res.render('index', {
                    group: ORGANIZER,
                    ac: str
                });
            } else {
                acc.find({}, function (err, doc) {
                    if (!err) { str = doc[0].value + '/' + doc[1].value; }
                    res.render('index', {
                        group: ORGANIZER,
                        ac: str
                    });
                });
            }
        });
    });
});

// その他
app.all('/*', function (req, res) {
    res.send('nice boat');
});

app.listen(port);
console.log(moment().format("YYYY年MM月DD日 HH:mm:ss") + " server starting...port:" + port + " " + serverTimeStamp);
