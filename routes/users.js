const passport         = require('passport');
const User             = require('../model/users');
const Code             = require('../model/codes');
const LocalStrategy    = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const TwitterStrategy  = require('passport-twitter').Strategy;

// TODO: api keyとcallback domainの設定
const FACEBOOK_APP_ID     = "1824566707774891";
const FACEBOOK_APP_SECRET = "d2a925c2e88af0e3ea326dc32803e3ec";
const TWITTER_APP_ID      = "CFLImOOuCYNZvh9Nb8PhYO678";
const TWITTER_APP_SECRET  = "V6whEjJbImQ8qKyVJMV6KGVTJBqCDkqNyPrNtgivLkPISqcqiS";
const CALLBACK_DOMAIN     = "https://48v.me";

function mypage(req, res) {
    if (req.user) {
        Code.find({user: req.user._id}, {history: {$slice: 8}}).populate('history.terminal').then(docs => {
            res.render('mypage', {
                user: req.user,
                codes: docs
            })
        }).catch(err => {
            console.log(err);
            res.sendStatus(500);
        });
    } else {
        res.render('user');
    }
}

function update(req, res) {
    if (req.user) {
        // ユーザーが編集可能な項目を制限する。
        delete req.body._id;
        delete req.body.pw;
        delete req.body.facebook;
        delete req.body.twitter;

        req.user.update({$set: req.body}).exec()
            .then(result => {res.redirect('/user')})
            .catch(err => {
                //TODO: show more detailed error description for the user   e.g. email conflict
                res.sendStatus(400)
            })
    } else {
        res.sendStatus(403);
    }
}

function initPassport() {
    passport.serializeUser((user, done) => { done(null, user.id) });
    passport.deserializeUser((id, done) => { User.findById(id, done) });

    // emailとpasswordでの認証
    passport.use('local-login', User.createStrategy());
    passport.use('local-signup', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'pw',
        passReqToCallback: true
    }, function (req, email, pw, done) {
        delete req.body.pw;

        User.register(new User(req.body), pw, function (err, user) {
            if (!err) {
                done(null, user);
            } else if (err.name == 'BadRequestError') {
                done(null, false);  // 固有キー重複
            } else {
                console.log(err);
                done(err, user);     // サーバーエラー
            }
        });
    }));

    // 外部認証
    passport.use(new FacebookStrategy({
        clientID: FACEBOOK_APP_ID,
        clientSecret: FACEBOOK_APP_SECRET,
        callbackURL: CALLBACK_DOMAIN + "/auth/facebook/callback"
    }, function (accessToken, refreshToken, profile, done) {
        User.findOrCreate({facebook: profile.id}, done);
    }));

    passport.use(new TwitterStrategy({
        consumerKey: TWITTER_APP_ID,
        consumerSecret: TWITTER_APP_SECRET,
        callbackURL: CALLBACK_DOMAIN + "/auth/twitter/callback"
    }, function (accessToken, refreshToken, profile, done) {
        User.findOrCreate({twitter: profile.id}, done);
    }));

    return passport;
}

exports.mypage   = mypage;
exports.update   = update;
exports.passport = initPassport();