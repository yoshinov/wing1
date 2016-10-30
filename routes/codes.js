const Code  = require('../model/codes');
const coder = require('../coder');

function show(req, res) {
    const decoded = coder.decode(req.params.series, req.params.code).match(/^\d{8}$/);

    //TODO: refactor
    if (decoded) {
        const option = {
            user: req.user,
            series: req.params.series,
            code: req.params.code
        };

        Code.findOne({serial: decoded[0]}, {history: {$slice: 8}}).populate('history.terminal').populate('user').then(doc => {
            if (doc) {
                option.codeData = doc;
                res.render('codeInfo', option);
            } else {
                const code = new Code({serial: decoded[0]});
                code.save().then(product => {
                    option.codeDta = product;
                    res.render('codeInfo', option);
                })
            }
        }).catch(err => {
            console.log(err);
            res.sendStatus(500);
        });
    } else {
        res.render('notfound', {group: ""});
    }
}

function register(req, res) {
    Code.findOneAndUpdate({serial: req.body.serial}, {$set: {user: req.user._id}}).then(doc => {
        res.redirect('/u/' + req.params.series + '/' + req.params.code);
    });
    //TODO: error handle
}

exports.show     = show;
exports.register = register;