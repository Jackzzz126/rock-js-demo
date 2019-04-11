let route = {};

let httpDefault = require('../handle/httpDefault');
route["/"] = httpDefault.ok;
route["/favicon.ico"] = httpDefault.ok;

exports.route = route;

