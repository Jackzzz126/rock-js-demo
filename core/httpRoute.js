let route = {};

let common = require('../handle/common');
route[1001] = common.heartBeat;

exports.route = route;

