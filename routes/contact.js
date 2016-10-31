const Code    = require('../model/codes');
const coder   = require('../coder');
const CODELEN = 8;

function contact(req, res) {
    const c2         = req.body.serial.match(".*https://48v.me/u/(.*)/(.*)$");
    const isURLValid = c2 != null && c2[2] != null && c2[2].length == CODELEN;
    const decoded    = isURLValid ? coder.decode(c2[1], c2[2]).match(/^\d{8}$/) : null;

    var option = {
        color: "",
        resmes: "",
        resmes2: "",
        accesspoint: '/e',
        tid: null
    };

    if (!decoded) {
        option.color   = "#AA0000";
        option.resmes  = "正しいコードではありません";
        option.resmes2 = "Invalid code";
        res.render('op', option);
    } else {
        Code.findOneAndUpdate({serial: decoded[0]}, {
            $push: {
                history: {
                    event: req.body.event,
                    tid: null,
                    mt: new Date(),
                    info: "",
                    ip: req.ip,
                    vsr: null
                }
            }
        }, {upsert: true}).then(doc => {
            //TODO: コード情報をもとにした表示
            const visit = doc ? doc.history.length + 1 : 1;

            option.color   = "#0000FF";
            option.resmes  = "受け付けました　" + visit + "回目の御来店です。";
            option.resmes2 = "Accepted";
            res.render('op', option);
        });
    }
}

module.exports = contact;