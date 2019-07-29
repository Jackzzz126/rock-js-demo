let pub = {};
let pri = {};

let normal = require('../httpHandle/normal');
pub["/"] = normal.ok;
pub["/favicon.ico"] = normal.ok;
pub["/test"] = normal.test;
pub["/login"] = normal.login;

pub["1001"] = normal.heartBeat;

exports.pub = pub;
exports.pri = pri;

