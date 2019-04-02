function heartBeat(connData, reqMsg, cb) {
	let resMsg = {};
	rtnMsg.status = {};
	rtnMsg.status.code = 0;
	rtnMsg.status.msg = "OK";
	cb(resMsg);
}

exports.heartBeat = heartBeat;
