let route = {};

let common = require('../route/common');
route[1001] = common.heartBeat;

exports.route = route;

