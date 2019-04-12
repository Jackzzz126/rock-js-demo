let route = {};

let normal = require('../httpHandle/normal');
route["/"] = normal.ok;
route["/favicon.ico"] = normal.ok;
route["/test"] = normal.test;

exports.route = route;

