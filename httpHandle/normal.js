function ok(reqMsg, cb) {
	let resMsg = {};
	resMsg.status = gErrors.OK;
	return cb(resMsg);
}
function test(reqMsg, cb) {
	let resMsg = {};
	resMsg.status = gErrors.OK;
	return cb(resMsg);
}

function heartBeat(reqMsg, cb) {
	let resMsg = {};
	resMsg.status = gErrors.OK;
	return cb(resMsg);
}

exports.ok = ok;
exports.test = test;
exports.heartBeat = heartBeat;

