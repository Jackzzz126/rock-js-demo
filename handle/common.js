function heartBeat(connData, reqMsg, cb) {
	let resMsg = {};
	resMsg.status = {};
	resMsg.status.code = 0;
	resMsg.status.msg = "OK";
	cb(resMsg);
}

exports.heartBeat = heartBeat;
