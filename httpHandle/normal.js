function ok(pathname, reqMsg, cb) {
	let resMsg = {};
	resMsg.status = gErrors.OK;
	return cb(resMsg);
}
function test(pathname, reqMsg, cb) {
	let resMsg = {};
	resMsg.status = gErrors.OK;
	return cb(resMsg);
}

exports.ok = ok;
exports.test = test;

