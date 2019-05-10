let url = require('url');
let proto = require('./proto');

let httpRoute = require('./httpRoute').route;

function onReq(request, response){
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
			_handleBin(request, response, postBuff, urlObj);
		} else {
			_handleNormal(request, response, postBuff, urlObj);
		}
	});
}

function _handleBin(request, response, postBuff, urlObj) {
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
	reqMsg = proto.parsePack(packId, packBuff);
	handleFunc = httpRoute[packId];

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
			return _OnSessionErrorBin();
		} else {
			_ValidSession(reqMsg.sid, function(err, reply){
				if(err) {
					return _Response500Bin();
				}
				if(reply) {
					reqMsg._sessionObj = reply;
					return _RunHandleBin();
				} else {
					return _OnSessionErrorBin();
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
	function _OnSessionErrorBin() {
		let resMsg = {};
		resMsg.status = gErrors.COMM_SESSION_ERROR;
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
			gLog.debug("Exception: %s when handle %s", ex.message, packName);
			gLog.debug("stack: %s", ex.stack);
			_Response500Bin();
			return;
		}
	}
}

function _handleNormal(request, response, postBuff, urlObj) {
	let method = request.method;
	let reqMsg = null;
	let pathname = urlObj.pathname.toLowerCase();
	let handleFunc = httpRoute[pathname];

	if(method === "GET") {
		if(urlObj.query) {
			reqMsg = urlObj.query;
		}
	} else if(method === "POST"){
		let reqStr = postBuff.toString("utf8");
		if(reqStr) {
			reqMsg = JSON.parse(reqStr);
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
			return _OnSessionError();
		} else {
			_ValidSession(reqMsg.sid, function(err, reply){
				if(err) {
					return _Response500();
				}
				if(reply) {
					reqMsg._sessionObj = reply;
					return _RunHandle();
				} else {
					return _OnSessionError();
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
	function _OnSessionError() {
		let resMsg = {};
		resMsg.status = gErrors.COMM_SESSION_ERROR;
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
			gLog.debug("Exception: %s when handle %s", ex.message, pathname);
			gLog.debug("stack: %s", ex.stack);
			_Response500();
			return;
		}
	}
}

function _ValidSession(sid, cb) {
	_GetUid(sid);
	function _GetUid(sid) {
		gRedisClient.get(gRedisPrefix.session + sid, function(err, reply){
			if(err) {
				return cb(err, false);
			} else {
				if(!reply) {
					return cb(null, false);
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
					return cb(null, false);
				} else {
					let sObj = JSON.parse(reply);
					if(sObj.sid === sid) {
						sObj.uid = uid;
						return cb(null, sObj);
					} else {
						return cb(null, false);
					}
				}
			}
		});
	}
}

exports.onReq = onReq;

