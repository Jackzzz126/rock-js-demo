let route = require('./route').route;
let proto = require('./proto');

function onConn(socket) {
	gLog.debug("Client connected: " + socket.remoteAddress + ":" + socket.remotePort);
	socket.setNoDelay(true);
	socket.connData = {};

	let dataPacksRecved = [];

	socket.on("data", onRecvData);
	socket.on("error", onSocketError);
	socket.on("close", onSocketClose);
	socket.on("timeout", onSocketTimeout);
	function onRecvData(dataBuff)
	{
		dataPacksRecved.push(dataBuff);
		while(true) {
			if(!_parsePack()) {
				break;
			}
		}
	}

	function onSocketError(err) {
		gLog.debug("socket error: ", err);
	}
	function onSocketClose(hasError) {
		if(hasError) {
			gLog.debug("socket close with error");
		} else {
			gLog.debug("socket close");
		}
	}
	function onSocketTimeout()
	{
		socket.end();
		gLog.debug("socket time out.");
	}

	function _parsePack() {
		let buff = Buffer.concat(dataPacksRecved);
		let headLen = 8;
		let buffLen = buff.length;
		if(buffLen < headLen) {
			return false;
		}
		/*jshint bitwise:false*/
		var packId = buff.readInt32BE(0) ^ 0x79669966;
		var packLen = buff.readInt32BE(4) ^ 0x79669966;

		if(packLen > 1024 * 4) {
			gLog.debug("Pack too long.(>4k)");
			socket.close();
			return false;
		} else if(packLen < 0) {
			gLog.debug(socket, "Pack size error.(<0)");
			socket.close();
			return false;
		}
		if(buffLen < (packLen + headLen)) {
			return false;
		}

		let hasHandle = (typeof route[packId]) === 'function';
		if (!hasHandle) {
			gLog.debug("No handle for pack: %d.", packId);
		}

		var packBuff = buff.slice(headLen, headLen + packLen);
		let reqMsg = proto.parsePack(packId, packBuff);
		if(!reqMsg) {
			gLog.debug("Error when pase pack: %d.", packId);
		}

		if(hasHandle && reqMsg) {
			try {
				route[packId](socket.connData, reqMsg, function(resMsg) {
					proto.sendPack(socket, packId + 1, resMsg);
				});
			} catch(ex) {
				gLog.debug("Exception: %s when handle %d, uid: %d.", ex.message, packId, socket.uid);
				gLog.error(ex.stack);
			}
		}

		dataPacksRecved = [];
		var restLen = buffLen - headLen - packLen;
		if(restLen <= 0) {
			return false;
		} else {
			var restBuff = new Buffer(restLen);
			buff.copy(restBuff, 0, headLen + packLen, buffLen);
			dataPacksRecved.push(restBuff);
			return true;
		}
	}
}

exports.onConn = onConn;

