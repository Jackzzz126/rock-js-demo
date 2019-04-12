function ok(pathname, method, reqMsg, cb) {
	let resMsg = {};
	resMsg.status = gErrors.OK;
	return cb(resMsg);
}
function test(pathname, method, reqMsg, cb) {
	let resMsg = {};
	resMsg.status = gErrors.OK;
	return cb(resMsg);
}

exports.ok = ok;
exports.test = test;
