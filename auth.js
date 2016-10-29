const Passport         = require('passport').Passport;
const User             = require('./model/users').user;
const Terminal         = require('./model/terminals');
const LocalStrategy    = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const TwitterStrategy  = require('passport-twitter').Strategy;

// TODO: api keyとcallback domainの設定
const FACEBOOK_APP_ID     = "1824566707774891";
const FACEBOOK_APP_SECRET = "d2a925c2e88af0e3ea326dc32803e3ec";
const TWITTER_APP_ID      = "CFLImOOuCYNZvh9Nb8PhYO678";
const TWITTER_APP_SECRET  = "V6whEjJbImQ8qKyVJMV6KGVTJBqCDkqNyPrNtgivLkPISqcqiS";
const CALLBACK_DOMAIN     = "http://localhost:3000";

function initUser() {
    const passport = new Passport();

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });

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
        User.findOrCreate({facebook: profile.id}, function (err, user) {
            done(err, user);
        });
    }));

    passport.use(new TwitterStrategy({
        consumerKey: TWITTER_APP_ID,
        consumerSecret: TWITTER_APP_SECRET,
        callbackURL: CALLBACK_DOMAIN + "/auth/twitter/callback"
    }, function (accessToken, refreshToken, profile, done) {
        User.findOrCreate({twitter: profile.id}, function (err, user) {
            done(err, user);
        });
    }));

    return passport;
}

function initTerminal() {
    const passport = new Passport();

    passport.serializeUser(function (term, done) {
        done(null, term.id);
    });

    passport.deserializeUser(function (id, done) {
        Terminal.findById(id, function (err, term) {
            done(err, term);
        });
    });

    passport.use('terminal-login', Terminal.createStrategy());
    passport.use('terminal-signup', new LocalStrategy({
        usernameField: 'tid',
        passwordField: 'pw',
        passReqToCallback: true
    }, function (req, tid, pw, done) {
        delete req.body.pw;

        Terminal.register(new Terminal(req.body), pw, function (err, user) {
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

    return passport;
}

exports.user = initUser();
exports.term = initTerminal();