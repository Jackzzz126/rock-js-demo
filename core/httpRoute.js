let route = {};

let normal = require('../httpHandle/normal');
route["/"] = normal.ok;
route["/favicon.ico"] = normal.ok;
route["/test"] = normal.test;
route["/login"] = normal.login;

route["1001"] = normal.heartBeat;

exports.route = route;

