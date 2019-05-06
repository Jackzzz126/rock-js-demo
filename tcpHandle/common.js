function heartBeat(reqMsg, cb) {
	let resMsg = {};
	resMsg.status = gErrors.OK;
	return cb(resMsg);
}

exports.heartBeat = heartBeat;
