let url = require('url');

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
			gLog.debug("---> %s %s", pathname, JSON.stringify(reqObj));
			if(typeof(httpRoute[pathname]) === "function") {
				httpRoute[pathname](pathname, method, reqObj, function(resObj) {
					response.writeHead(200, {
						"Content-Type" : "text/plain"
					});
					let resStr = JSON.stringify(resObj);
					gLog.debug("<--- %s %s", pathname, resStr);
					response.write(resStr);
					response.end();
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
			"Content-Type" : "text/plain"
		});
		let resStr = "404 Not found";
		gLog.debug("<--- %s %s", pathname, resStr);
		response.write(resStr);
		response.end();
	}
	function _Response500(response) {
		response.writeHead(500, {
			"Content-Type" : "text/plain"
		});
		let resStr = "500 Internal Error";
		gLog.debug("<--- %s %s", pathname, resStr);
		response.write(resStr);
		response.end();
	}
}

exports.onReq = onReq;

