let protobuf = require("protobufjs");
let async = require('async');

let numMsg = {};//msgNum : msgObj

function init(protoPath, msgNum, cb1) {
	async.eachOf(msgNum, function(module, key, cb2) {
		protobuf.load(protoPath + "/" + key + ".proto", function (err, root) {
			if(err) {
				cb2(err);
				return;
			}
			for(let i in module) {
				numMsg[module[i][1]] = root.lookupType(module[i][0]);
			}
			cb2();
		});
	}, function(err) {
		cb1(err);
	});
}
function parsePack(packId, packBuff) {
	let msg = numMsg[packId];
	if(!msg) {
		return null;
	} else {
		let packObj = msg.decode(packBuff);
		gLog.debug("req: %d %s", packId, JSON.stringify(packObj));
		return packObj;
	}
}

function sendPack(socket, packId, packObj) {
	gLog.debug("res: %d %s", packId, JSON.stringify(packObj));
	var dataBuff = numMsg[packId].encode(packObj).finish();
	var headBuff = new Buffer(8);
	/*jshint bitwise:false*/
	headBuff.writeInt32BE(packId ^ 0x79669966, 0);
	headBuff.writeInt32BE(dataBuff.length ^ 0x79669966, 4);

	if(socket.writable)
	{
		socket.write(headBuff);
		socket.end(dataBuff);
	}
}

exports.init = init;
exports.parsePack = parsePack;
exports.sendPack = sendPack;


