let route = {};

let common = require('../tcpHandle/common');
route[1001] = common.heartBeat;

exports.route = route;

