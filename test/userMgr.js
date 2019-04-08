var net = require("net");

let proto = require('../core/proto');

function newUser() {
	let user = {};

	user.conn = function(port, ip, cb) {
		var dataPacksRecved = [];

		let socket = net.createConnection(port, ip);
		socket.connData = {};
		user._socket = socket;
		socket.on("connect", onConn);
		socket.on("error", onError);
		socket.on("data", onRecvData);

		function onConn(){
			cb();
		}
		function onError(err) {
			gLog.debug("Socket error: ", err);
		}

		function onRecvData(dataBuff)
		{
			dataPacksRecved.push(dataBuff);
			while(true) {
				if(!_parsePack()) {
					break;
				}
			}
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
				socket.end();
				return false;
			} else if(packLen < 0) {
				gLog.debug(socket, "Pack size error.(<0)");
				socket.end();
				return false;
			}
			if(buffLen < (packLen + headLen)) {
				return false;
			}

			if (typeof user[packId] !== 'function')
			{
				gLog.debug("No handle for pack: %d.", packId);
			}
			var packBuff = buff.slice(headLen, headLen + packLen);
			let reqMsg = proto.parsePack(packId, packBuff);
			if(!reqMsg) {
				gLog.debug("Error when pase pack: %d.", packId);
			}
			try
			{
				user[packId](reqMsg);
			}
			catch(ex)
			{
				gLog.debug("Exception: %s when handle %d, uid: %d.", ex.message, packId, socket.uid);
				gLog.error(ex.stack);
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
	};

	user.sendPack = function(packId, reqMsg) {
		proto.sendPack(this._socket, packId, reqMsg);
	};

	user.closeConn = function() {
		this._socket.end();
	};

	user.setId = function(id) {
		this._socket.connData.id = id;
	};

	return user;
}
exports.newUser = newUser;
