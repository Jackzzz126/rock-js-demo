let pub = {};
let pri = {};

let common = require('../tcpHandle/common');
pub[1001] = common.heartBeat;

exports.pub = pub;
exports.pri = pri;

