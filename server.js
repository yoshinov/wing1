// default get access handler
var serverTimeStamp = 'Time-stamp: <2016-10-26 11:11:21 yoshinov>';

'use strict';

const port      = 80;
const ORGANIZER = '48v研究会';

// サーバー実装の前に、エラーハンドリングを記載します。
process.on('uncaughtException', err => {console.log(err)});

const express    = require('express');
const app        = express();
const path       = require('path');
const bodyParser = require('body-parser');
const session    = require('express-session');
const logger     = require('morgan');
const MongoStore = require('connect-mongo')(session);
const moment     = require('moment');
const mongoose   = require('mongoose');

const coder        = require('./coder');
const sync         = require('./routes/sync');
const codes        = require('./routes/codes');
const userPassport = require('./routes/users');

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

app.use(userPassport.initialize());
app.use(userPassport.session());

// app.get('/term', (req, res) => { res.render('term', {term: req.user}) });
//
// app.get('/term/register', (req, res) => { res.render('termReg', {}) });
// app.post('/term/register', termPassport.authenticate('terminal-signup', {
//     successRedirect: '/term',
//     failureRedirect: '/term/register'
// }));
//
// app.get('/term/login', (req, res) => { res.render('termLogin', {term: req.term}) });
// app.post('/term/login', termPassport.authenticate('terminal-login', {
//     successRedirect: '/term',
//     failureRedirect: '/term/login'
// }));
//
// app.get('/term/logout', (req, res) => {
//     req.logout();
//     res.redirect('/term');
// });

app.get('/u/:series/:code', codes.show);
app.post('/u/:series/:code', codes.register);

app.get('/user', (req, res) => { res.render('user', {user: req.user}) });

app.get('/user/register', (req, res) => { res.render('register', {}) });
app.post('/user/register', userPassport.authenticate('local-signup', {
    successRedirect: '/user',
    failureRedirect: '/user/register'
}));

app.get('/user/login', (req, res) => { res.render('login', {user: req.user}) });
app.post('/user/login', userPassport.authenticate('local-login', {
    successRedirect: '/user',
    failureRedirect: '/user/login'
}));

app.get('/user/logout', (req, res) => {
    req.logout();
    res.redirect('/user');
});

app.get('/auth/twitter', userPassport.authenticate('twitter'));
app.get('/auth/twitter/callback', userPassport.authenticate('twitter', {
    successRedirect: '/',
    failureRedirect: '/user/login'
}));

app.get('/auth/facebook', userPassport.authenticate('facebook'));
app.get('/auth/facebook/callback', userPassport.authenticate('facebook', {
    successRedirect: '/',
    failureRedirect: '/user/login'
}));

app.post('/pull', sync.pull);
app.post('/push', sync.push);

//
// 以下，サイト共通
//

// CSS file対応
// app.get('/css/:file', (req, res) => {
//     res.sendFile(CSS_DIR + req.params.file);
// });

// 2016/8/6 vpn 証明書に対応する
// /usr/local/certbot/certbot-auto renew --force-renew --webroot -w /home/yoshinov/vpn
//  http://48v.me/.well-known/ にアクセスがあったとき，それ以下の文字列をファイル名とみなして中身をテキストとして返送する
app.get('/.well-known/acme-challenge/:file', (req, res) => {
    //res.send('hello ' + req.params.file);
    res.sendFile('/home/yoshinov/vpn/.well-known/acme-challenge/' + req.params.file);
});


// default root
const acc = require('./model/acc');

app.get('/', (req, res) => {
    acc.update({cc: 'ac2'}, {$inc: {value: 0}}, {upsert: true}, (err) => {
        acc.update({cc: 'ac1'}, {$inc: {value: 1}}, {upsert: true}, (err) => {
            var str = '?/?';
            if (err) {
                res.render('index', {
                    group: ORGANIZER,
                    ac: str
                });
            } else {
                acc.find({}, (err, doc) => {
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
app.all('/*', (req, res) => { res.send('nice boat') });

app.listen(port);
console.log(moment().format("YYYY年MM月DD日 HH:mm:ss") + " server starting...port:" + port + " " + serverTimeStamp);
