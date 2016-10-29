const passport      = require('passport');
const Terminal      = require('../model/terminals');
const LocalStrategy = require('passport-local').Strategy;

function init() {
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
        usernameField: '_id',
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

module.exports = init();