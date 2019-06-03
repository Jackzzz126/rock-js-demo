let tcpRoute = require('./tcpRoute').route;
let proto = require('./proto');
let rock = require('../rock');

function onConn(socket) {
	gLog.debug("Client connected: " + socket.remoteAddress + ":" + socket.remotePort);
	socket.setNoDelay(true);
	socket.connData = {};
	socket.connData.lat = rock.time.curTimeMs();
	//uid: (string) socket identifycaton
	//lat: (uint64) last active time in ms
	gAllSockets.push(socket);

	let dataPacksRecved = [];

	socket.on("data", onRecvData);
	socket.on("error", onSocketError);
	socket.on("close", onSocketClose);
	socket.on("timeout", onSocketTimeout);
	function onRecvData(dataBuff)
	{
		if(socket.destroyed) {
			return;
		}
		dataPacksRecved.push(dataBuff);
		while(true) {
			if(!_parsePack()) {
				break;
			}
		}
	}

	function onSocketError(err) {
		let uid = 0;
		if(socket.connData.uid) {
			uid = socket.connData.uid;
		}
		gLog.debug("%s socket error: ", uid, err);
	}
	function onSocketClose(hasError) {
		let uid = 0;
		if(socket.connData.uid) {
			uid = socket.connData.uid;
		}
		if(hasError) {
			gLog.debug("%s socket close with error", uid);
		} else {
			gLog.debug("%s socket close with no error", uid);
		}
		if(uid) {
			gLog.debug("%s exit by close", uid);
		}
		socket.destroy();
		for(let i in gAllSockets) {
			if(gAllSockets[i] === socket) {
				gAllSockets.splice(i, 1);
				break;
			}
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

		let uid = 0;
		if(socket.connData.uid) {
			uid = socket.connData.uid;
		}

		if(packLen > 1024 * 4) {
			gLog.debug("%s %d Pack too long(>4k)", uid, packId);
			socket.end();
			return false;
		} else if(packLen < 0) {
			gLog.debug("%s %d Pack size error(<0)", uid, packId);
			socket.end();
			return false;
		}
		if(buffLen < (packLen + headLen)) {
			return false;
		}

		let hasHandle = (typeof tcpRoute[packId]) === 'function';
		if (!hasHandle) {
			gLog.debug("%s %d No handle for pack", uid, packId);
		}

		var packBuff = buff.slice(headLen, headLen + packLen);
		let reqMsg = null;
		try {
			reqMsg = proto.parsePack(packId, packBuff);
		} catch(ex) {
			gLog.debug("%s %d Exception: %s when parse pack", uid, packId, ex.message);
			gLog.error(ex.stack);
		}

		if(!gConfig.serverConfig.noLogIds[packId]) {
			let packName = proto.getPackNamById(packId);
			if(!packName) {
				packName = packId;
			}
			if(packLen > 1024) {
				gLog.debug("---> %s %s", uid, packName);
			} else {
				gLog.debug(reqMsg, "---> %s %s", uid, packName);
			}
		}

		if(hasHandle && reqMsg) {
			try {
				if(!gConfig.serverConfig.noAuthIds[packId] && !socket.connData.uid) {
					let resMsg = {};
					resMsg.status = gErrors.COMM_USERID_ERROR;
					sendPack(socket, packId + 1, resMsg);
				} else {
					reqMsg._connData = socket.connData;
					tcpRoute[packId](reqMsg, function(resMsg) {
						sendPack(socket, packId + 1, resMsg);
					});
				}
			} catch(ex) {
				gLog.debug("%s %d Exception: %s when handle pack", uid, packId, ex.message);
				gLog.error(ex.stack);
			}
		}

		dataPacksRecved = [];
		var restLen = buffLen - headLen - packLen;
		if(restLen <= 0) {
			return false;
		} else {
			var restBuff = Buffer.alloc(restLen);
			buff.copy(restBuff, 0, headLen + packLen, buffLen);
			dataPacksRecved.push(restBuff);
			return true;
		}
	}
}

function sendPack(socket, packId, resMsg) {
	if(socket.destroyed) {
		return;
	}
	let buff = proto.formBuff(packId, resMsg);
	if(!gConfig.serverConfig.noLogIds[packId]) {
		let uid = 0;
		if(socket.connData && socket.connData.uid) {
			uid = socket.connData.uid;
		}
		let packName = proto.getPackNamById(packId);
		if(!packName) {
			packName = packId;
		}
		if(buff.length > 1024) {
			gLog.debug("<--- %s %s", uid, packName);
		} else {
			gLog.debug(resMsg, "<--- %s %s", uid, packName);
		}
	}
	if(socket.writable) {
		socket.write(buff);
	} else {
		gLog.debug("socket is unwritable");
	}
}

function sendPackToUser(userId, packId, packObj) {
	for(let i in gAllSockets) {
		if(gAllSockets[i].connData.uid === userId) {
			sendPack(gAllSockets[i], packId, packObj);
			break;
		}
	}
}

function closeUserConn(userId) {
	for(let i in gAllSockets) {
		if(gAllSockets[i].connData.uid === userId) {
			gAllSockets[i].end();
			gAllSockets[i].destroy();
			gAllSockets.splice(i, 1);
			break;
		}
	}
}

exports.onConn = onConn;
exports.sendPack = sendPack;
exports.sendPackToUser = sendPackToUser;
exports.closeUserConn = closeUserConn;

