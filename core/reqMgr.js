let url = require('url');

function onReq(request, response){
	var postData = [];
	var pathname = url.parse(request.url).pathname;

	var addressStr = request.socket.remoteAddress;
	if(addressStr) {
		addressStr = addressStr.substr(addressStr.lastIndexOf(":") + 1);
		addressStr += ":" + request.socket.remotePort;
		gLog.debug('conn: %s', addressStr);
	}

	request.addListener("data", function(postDataChunk) {
		postData.push(postDataChunk);
	});
	request.addListener("end", function() {
		if(pathname === '/') {
			try {
				var msgStr = postData.toString("utf8");
				gLog.debug('recv: %s', msgStr);
			} catch (ex) {
				gLog.warn("Exception: %s when handle %s.", ex.message, pathname);
				gLog.warn(ex.stack);
				_Response500(response);
				return;
			}
		} else {
			gLog.warn("Unexpected url:" + pathname);
			_Response404(response);
			return;
		}
	});
	function _Response404(response) {
		response.writeHead(404, {
			"Content-Type" : "text/plain"
		});
		response.write("404 Not found");
		response.end();
	}
	function _Response500(response) {
		response.writeHead(500, {
			"Content-Type" : "text/plain"
		});
		response.write("500 Internal Error");
		response.end();
	}
	function _Response200(response, str) {
		response.write(str);
		response.end();
	}
}

exports.onReq = onReq;

