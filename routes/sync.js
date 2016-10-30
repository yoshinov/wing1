const pullInterval = 600000;    //ミリ秒

const User = require('../model/users');
const Code = require('../model/codes');

/**
 * 端末に最新のデータ変更を渡す。
 **/
function pull(req, res) {
    const userData = User.find({updatedAt: {$gt: req.body.lastPullTime}}, req.body.userProjection);
    const codeData = Code.aggregate({$match: {updatedAt: {$gt: req.body.lastPullTime}}}).append(req.body.codePipeline);

    Promise.all([userData, codeData]).then(results => {
        console.log('pulled data: ' + JSON.stringify(results));

        // TODO: set different pullInterval for each clients. use req.body.tid for that.
        res.json({
            users: results[0],
            codes: results[1],
            pullInterval: pullInterval
        });
    }).catch(err => {
        console.log(err);
        res.sendStatus(500);
    });
}

/**
 * 端末でのデータ変更を受け取る。
 **/
function push(req, res) {
    Code.findOneAndUpdate({serial: req.body.serial}, {
        $set: {serial: req.body.serial},
        $push: {history: req.body.history}
    }, {upsert: true})
        .then(doc => {
            console.log('pushed data: ' + JSON.stringify(req.body));
            res.sendStatus(200);
        })
        .catch(err => {
            console.log('usersdb create err: ' + err);
            res.sendStatus(500);
        });
}

exports.pull = pull;
exports.push = push;
