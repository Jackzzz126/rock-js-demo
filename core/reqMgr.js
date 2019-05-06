let url = require('url');
let proto = require('./proto');

let httpRoute = require('./httpRoute').route;

function onReq(request, response){
	let postData = [];
	let urlObj = url.parse(request.url, true);
	let pathname = urlObj.pathname;
	let packName = null;

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
		try {
			let method = request.method;
			let reqMsg = null;
			let packId = 0;
			let handleFunc = null;
			if(pathname.toLowerCase() === "/bin") {
				let postBuff = Buffer.concat(postData);
				let headLen = 8;
				let buffLen = postBuff.length;
				if(buffLen < headLen) {
					_Response500();
					return;
				}
				/*jshint bitwise:false*/
				packId = postBuff.readInt32BE(0) ^ 0x79669966;
				packName = proto.getPackNamById(packId);
				let packLen = postBuff.readInt32BE(4) ^ 0x79669966;
				if((packLen + headLen) !== buffLen) {
					_Response500();
					return;
				}
				let packBuff = postBuff.slice(headLen, headLen + packLen);
				reqMsg = proto.parsePack(packId, packBuff);
				handleFunc = httpRoute[packId];
				if(!gConfig.serverConfig.noLogIds[packId]) {
					if(!packName) {
						packName = packId;
					}
					gLog.debug(reqMsg, "---> %s", packName);
				}
				if(!gConfig.serverConfig.noAuthIds[packId] && !reqMsg.sid) {
					let resMsg = {};
					resMsg.status = gErrors.COMM_SESSION_ERROR;
					let buff = proto.formBuff(packId + 1, resMsg);
					response.write(buff);
					response.end();
					gLog.debug(resMsg, "<--- %s", packName);
					return;
				}
			} else {
				if(method === "GET") {
					if(urlObj.query) {
						reqMsg = urlObj.query;
					}
				} else if(method === "POST"){
					let postBuff = Buffer.concat(postData);
					let reqStr = postBuff.toString("utf8");
					if(reqStr) {
						reqMsg = JSON.parse(reqStr);
					}
				} else {
					gLog.debug("Unknown method %s", method);
				}
				handleFunc = httpRoute[pathname];
				if(!gConfig.serverConfig.noLogIds[pathname]) {
					gLog.debug(reqMsg, "---> %s", pathname);
				}
				if(!gConfig.serverConfig.noAuthIds[pathname] && !reqMsg.sid) {
					let resMsg = {};
					resMsg.status = gErrors.COMM_SESSION_ERROR;
					let resStr = JSON.stringify(resMsg);
					response.write(resStr);
					response.end();
					gLog.debug(resMsg, "<--- %s", pathname);
					return;
				}
			}
			pathname = pathname.toLowerCase();
			if(typeof(handleFunc) === "function") {
				handleFunc(reqMsg, function(resMsg) {
					if(pathname.toLowerCase() === "/bin") {
						gLog.debug(resMsg, "<--- %s", packName);
						response.writeHead(200, {
							"Content-Type" : "application/proto"
						});
						let buff = proto.formBuff(packId + 1, resMsg);
						response.write(buff);
						response.end();
					} else {
						gLog.debug(resMsg, "<--- %s", pathname);
						response.writeHead(200, {
							"Content-Type" : "application/json"
						});
						let resStr = JSON.stringify(resMsg);
						response.write(resStr);
						response.end();
					}
				});
			} else {
				_Response404(response);
				return;
			}
		} catch (ex) {
			if(packName) {
				gLog.debug("Exception: %s when handle %s", ex.message, packName);
			} else {
				gLog.debug("Exception: %s when handle %s", ex.message, pathname);
			}
			gLog.debug("stack: %s", ex.stack);
			_Response500(response);
			return;
		}
	});
	function _Response404(response) {
		response.writeHead(404, {
			"Content-Type" : "application/json"
		});
		let resStr = "404 Not found";
		gLog.debug("<--- %s %s", pathname, resStr);
		response.write(resStr);
		response.end();
	}
	function _Response500(response) {
		response.writeHead(500, {
			"Content-Type" : "application/json"
		});
		let resStr = "500 Internal Error";
		gLog.debug("<--- %s %s", pathname, resStr);
		response.write(resStr);
		response.end();
	}
}

exports.onReq = onReq;

