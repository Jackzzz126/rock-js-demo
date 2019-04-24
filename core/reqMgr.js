let url = require('url');
let proto = require('./proto');

let httpRoute = require('./httpRoute').route;

function onReq(request, response){
	let postData = [];
	let urlObj = url.parse(request.url, true);
	let pathname = urlObj.pathname;

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
			let reqObj = null;
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
				let packLen = postBuff.readInt32BE(4) ^ 0x79669966;
				if((packLen + headLen) !== buffLen) {
					_Response500();
					return;
				}
				let packBuff = postBuff.slice(headLen, headLen + packLen);
				reqObj = proto.parsePack(packId, packBuff);
				gLog.debug(reqObj, "---> %s", proto.getPackNamById(packId));
				handleFunc = httpRoute[packId];
			} else {
				if(method === "GET") {
					if(urlObj.query) {
						reqObj = urlObj.query;
					}
				} else if(method === "POST"){
					let postBuff = Buffer.concat(postData);
					let reqStr = postBuff.toString("utf8");
					if(reqStr) {
						reqObj = JSON.parse(reqStr);
					}
				} else {
					gLog.debug("Unknown method %s", method);
				}
				gLog.debug(reqObj, "---> %s", pathname);
				handleFunc = httpRoute[pathname];
			}
			pathname = pathname.toLowerCase();
			if(typeof(handleFunc) === "function") {
				handleFunc(reqObj, function(resObj) {
					if(pathname.toLowerCase() === "/bin") {
						response.writeHead(200, {
							"Content-Type" : "application/proto"
						});
						gLog.debug(resObj, "<--- %s", proto.getPackNamById(packId));
						let buff = proto.formBuff(packId + 1, resObj);
						response.write(buff);
						response.end();
					} else {
						response.writeHead(200, {
							"Content-Type" : "application/json"
						});
						gLog.debug(resObj, "<--- %s", pathname);
						let resStr = JSON.stringify(resObj);
						response.write(resStr);
						response.end();
					}
				});
			} else {
				_Response404(response);
				return;
			}
		} catch (ex) {
			gLog.debug("Exception: %s when handle %s", ex.message, pathname);
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

