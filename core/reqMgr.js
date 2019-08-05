let url = require('url');
let proto = require('./proto');

let httpRoute = require('./httpRoute');

function onReqPub(request, response){
	_OnReq(request, response, httpRoute.pub);
}
function onReqPri(request, response){
	_OnReq(request, response, httpRoute.pri);
}
function _OnReq(request, response, route){
	let postData = [];

	//var addressStr = request.socket.remoteAddress;
	//if(addressStr) {
	//	addressStr = addressStr.substr(addressStr.lastIndexOf(":") + 1);
	//	addressStr += ":" + request.socket.remotePort;
	//	gLog.debug('conn: %s', addressStr);
	//}

	request.addListener("data", function(postDataChunk) {
		postData.push(postDataChunk);
	});
	request.addListener("end", function() {
		let postBuff = Buffer.concat(postData);
		let urlObj = url.parse(request.url, true);

		let pathname = urlObj.pathname;
		if(pathname.toLowerCase() === "/bin") {
			_handleBin(request, response, postBuff, urlObj, route);
		} else {
			_handleNormal(request, response, postBuff, urlObj, route);
		}
	});
}

function _handleBin(request, response, postBuff, urlObj, route) {
	let packId = 0;
	let packName = null;
	let reqMsg = null;
	let handleFunc = null;

	let headLen = 8;
	let buffLen = postBuff.length;
	if(buffLen < headLen) {
		return _Response500Bin();
	}
	/*jshint bitwise:false*/
	packId = postBuff.readInt32BE(0) ^ 0x79669966;
	packName = proto.getPackNamById(packId);
	let packLen = postBuff.readInt32BE(4) ^ 0x79669966;
	if((packLen + headLen) !== buffLen) {
		return _Response500Bin();
	}
	let packBuff = postBuff.slice(headLen, headLen + packLen);
	try {
		reqMsg = proto.parsePack(packId, packBuff);
	} catch (ex) {
		gLog.debug("Exception when handle %s, parse proto error", packName);
		gLog.debug("%s", ex.message);
		gLog.debug("%s", ex.stack);
		return _Response500Bin();
	}
	handleFunc = route[packId];

	if(typeof(handleFunc) !== "function") {
		return _Response404Bin();
	}

	if(!gConfig.serverConfig.noLogIds[packId]) {
		if(packLen > 1024) {
			gLog.debug("---> %s", packName);
		} else {
			gLog.debug(reqMsg, "---> %s", packName);
		}
	}

	if(gConfig.serverConfig.noAuthIds[packId]) {
		return _RunHandleBin();
	} else {
		if(!reqMsg.sid) {
			return _OnSessionErrorBin(1);
		} else {
			_ValidSession(reqMsg.sid, function(err, reply){
				if(err) {
					return _Response500Bin();
				}
				if(reply.statusCode === 4) {
					reqMsg._sessionObj = reply.sObj;
					return _RunHandleBin();
				} else {
					return _OnSessionErrorBin(reply.statusCode);
				}
			});
		}
	}

	function _Response404Bin() {
		response.writeHead(404, {
			"Content-Type" : "application/json"
		});
		let resStr = "404 Not found";
		gLog.debug("<--- %s %s", packName, resStr);
		response.write(resStr);
		response.end();
	}
	function _Response500Bin() {
		response.writeHead(500, {
			"Content-Type" : "application/json"
		});
		let resStr = "500 Internal Error";
		gLog.debug("<--- %s %s", packName, resStr);
		response.write(resStr);
		response.end();
	}
	function _OnSessionErrorBin(sErrorCode) {
		let resMsg = {};
		if(sErrorCode === 2) {
			resMsg.status = gErrors.COMM_SESSION_EXPIRE;
		} else if(sErrorCode === 3) {
			resMsg.status = gErrors.COMM_SESSION_REPLACED;
		} else {//1
			resMsg.status = gErrors.COMM_SESSION_ERROR;
		}
		let buff = proto.formBuff(packId + 1, resMsg);
		response.write(buff);
		response.end();
		gLog.debug(resMsg, "<--- %s", packName);
		return;
	}
	function _RunHandleBin() {
		try {
			handleFunc(reqMsg, function(resMsg) {
				response.writeHead(200, {
					"Content-Type" : "application/proto"
				});
				let buff = proto.formBuff(packId + 1, resMsg);
				if(!gConfig.serverConfig.noLogIds[packId]) {
					if(buff.length > 1024) {
						gLog.debug("<--- %s", packName);
					} else {
						gLog.debug(resMsg, "<--- %s", packName);
					}
				}
				response.write(buff);
				response.end();
			});
		} catch (ex) {
			gLog.debug("Exception when handle %s", packName);
			gLog.debug("%s", ex.message);
			gLog.debug("%s", ex.stack);
			_Response500Bin();
			return;
		}
	}
}

function _handleNormal(request, response, postBuff, urlObj, route) {
	let method = request.method;
	let reqMsg = null;
	let pathname = urlObj.pathname.toLowerCase();
	let handleFunc = route[pathname];

	if(method === "GET") {
		if(urlObj.query) {
			reqMsg = urlObj.query;
		}
	} else if(method === "POST"){
		let reqStr = postBuff.toString("utf8");
		try {
			if(reqStr) {
				reqMsg = JSON.parse(reqStr);
			}
		} catch (ex) {
			gLog.debug("Exception when handle %s, parse json error: %s", pathname, reqStr);
			gLog.debug("%s", ex.message);
			gLog.debug("%s", ex.stack);
			return _Response500();
		}
	} else {
		gLog.debug("Unknown method %s", method);
		return;
	}

	if(typeof(handleFunc) !== "function") {
		return _Response404();
	}

	if(!gConfig.serverConfig.noLogIds[pathname]) {
		if(postBuff.length > 1024) {
			gLog.debug("---> %s", pathname);
		} else {
			gLog.debug(reqMsg, "---> %s", pathname);
		}
	}

	if(gConfig.serverConfig.noAuthIds[pathname]) {
		return _RunHandle();
	} else {
		if(!reqMsg.sid) {
			return _OnSessionError(1);
		} else {
			_ValidSession(reqMsg.sid, function(err, reply){
				if(err) {
					return _Response500();
				}
				if(reply.statusCode === 4) {
					reqMsg._sessionObj = reply.sObj;
					return _RunHandle();
				} else {
					return _OnSessionError(reply.statusCode);
				}
			});
		}
	}

	function _Response404() {
		response.writeHead(404, {
			"Content-Type" : "application/json"
		});
		let resStr = "404 Not found";
		gLog.debug("<--- %s %s", pathname, resStr);
		response.write(resStr);
		response.end();
	}
	function _Response500() {
		response.writeHead(500, {
			"Content-Type" : "application/json"
		});
		let resStr = "500 Internal Error";
		gLog.debug("<--- %s %s", pathname, resStr);
		response.write(resStr);
		response.end();
	}
	function _OnSessionError(sErrorCode) {
		let resMsg = {};
		if(sErrorCode === 2) {
			resMsg.status = gErrors.COMM_SESSION_EXPIRE;
		} else if(sErrorCode === 3) {
			resMsg.status = gErrors.COMM_SESSION_REPLACED;
		} else {//1
			resMsg.status = gErrors.COMM_SESSION_ERROR;
		}
		let resStr = JSON.stringify(resMsg);
		response.write(resStr);
		response.end();
		gLog.debug("<--- %s %s", pathname, resStr);
		return;
	}
	function _RunHandle() {
		try {
			handleFunc(reqMsg, function(resMsg) {
				response.writeHead(200, {
					"Content-Type" : "application/json"
				});
				let resStr = JSON.stringify(resMsg);
				if(!gConfig.serverConfig.noLogIds[pathname]) {
					if(resStr.length > 1024) {
						gLog.debug("<--- %s", pathname);
					} else {
						gLog.debug(resMsg, "<--- %s", pathname);
					}
				}
				response.write(resStr);
				response.end();
			});
		} catch (ex) {
			gLog.debug("Exception when handle %s", pathname);
			gLog.debug("%s", ex.message);
			gLog.debug("%s", ex.stack);
			_Response500();
			return;
		}
	}
}

function _ValidSession(sid, cb) {
	let rtnObj = {};//statusCode: 1: error, 2: timeout, 3: replaced, 4: right
	_GetUid(sid);
	function _GetUid(sid) {
		gRedisClient.get(gRedisPrefix.session + sid, function(err, reply){
			if(err) {
				return cb(err, false);
			} else {
				if(!reply) {
					rtnObj.statusCode = 2;
					return cb(null, rtnObj);
				} else {
					_GetSObj(reply);
				}
			}
		});
	}

	function _GetSObj(uid) {
		gRedisClient.get(gRedisPrefix.sessionObj + uid, function(err, reply){
			if(err) {
				return cb(err, false);
			} else {
				if(!reply) {
					rtnObj.statusCode = 2;
					return cb(null, rtnObj);
				} else {
					let sObj = JSON.parse(reply);
					if(sObj.sid === sid) {
						sObj.uid = uid;
						gLog.debug("user id: %s", sObj.uid);

						rtnObj.statusCode = 4;
						rtnObj.sObj = sObj;
						return cb(null, rtnObj);
					} else {
						rtnObj.statusCode = 3;
						return cb(null, rtnObj);
					}
				}
			}
		});
	}
}

exports._OnReq = _OnReq;
exports.onReqPub = onReqPub;
exports.onReqPri = onReqPri;

