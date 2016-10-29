// default get access handler
var serverTimeStamp = 'Time-stamp: <2016-10-26 11:11:21 yoshinov>';

'use strict';

const port      = 3000;

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
const codes        = require('./routes/codes');
const termPassport = require('./routes/terminals');

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

app.use(termPassport.initialize());
app.use(termPassport.session());

app.get('/term', (req, res) => { res.render('term', {term: req.user}) });

app.get('/term/register', (req, res) => { res.render('termReg', {}) });
app.post('/term/register', termPassport.authenticate('terminal-signup', {
    successRedirect: '/term',
    failureRedirect: '/term/register'
}));

app.get('/term/login', (req, res) => { res.render('termLogin', {term: req.term}) });
app.post('/term/login', termPassport.authenticate('terminal-login', {
    successRedirect: '/term',
    failureRedirect: '/term/login'
}));

app.get('/term/logout', (req, res) => {
    req.logout();
    res.redirect('/term');
});

app.listen(port);
console.log(moment().format("YYYY年MM月DD日 HH:mm:ss") + " server starting...port:" + port + " " + serverTimeStamp);
