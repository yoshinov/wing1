// default get access handler
// hoge
var serverTimeStamp = 'Time-stamp: <2016-10-26 11:11:21 yoshinov>';

'use strict';

const port      = 80;
const ORGANIZER = '48v研究会';
const CSS_DIR   = '/home/yoshinov/css/';

// サーバー実装の前に、エラーハンドリングを記載します。
process.on('uncaughtException', function (err) {console.log(err);});

const app        = require('express')();
const bodyParser = require('body-parser');
const session    = require('express-session');
const logger     = require('morgan');
const MongoStore = require('connect-mongo')(session);
const moment     = require('moment');
const mongoose   = require('mongoose');
const sync       = require('./sync');
const acc        = require('./model/acc');

app.set('view engine', 'jade');
app.set('views', __dirname + '/views');

//app.use(logger('dev'));
app.use(logger('default'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost/wings');

// session使うための記述
app.use(session({
    secret: 'wingsnov',
    saveUninitialized: true,
    resave: false,
    store: new MongoStore({mongooseConnection: mongoose.connection})
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
    acc.update({cc:'ac2'}, {$inc: {value: 0}}, {upsert: true}, function (err) {
        acc.update({cc:'ac1'},{$inc: {value: 1}},{upsert: true},function (err){
            var str = '?/?';
            if (err) {
		res.render('index', {group: ORGANIZER, ac: str });
            }else{
                acc.find({}, function (err, doc) {
                    if (!err) { str = doc[0].value + '/' + doc[1].value; }
                    res.render('index', {group: ORGANIZER, ac: str });
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
console.log(moment().format("YYYY年MM月DD日 HH:mm:ss") + " server starting...port:" + port + " " + serverTimeStamp );
