let protobuf = require("protobufjs");
let async = require('async');
let fs = require('fs');
var hoconParser = require('hocon-parser');

let numMsg = {};//msgNum : msgObj

function init(protoPath, cb1) {
	fs.readFile(protoPath + '/msgId.conf', (err, data) => {
		if (err) {
			cb1(err);
			return;
		}
		let msgIds = null;
		try {
			msgIds = hoconParser(data.toString());
		} catch(ex) {
			cb1(new Error(ex));
			return;
		}
		async.eachOf(msgIds, function(module, key, cb2) {
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
	});
}
function parsePack(packId, packBuff) {
	let msg = numMsg[packId];
	if(!msg) {
		return null;
	} else {
		let packObj = msg.decode(packBuff);
		gLog.debug("recv: %d %s", packId, JSON.stringify(packObj));
		return packObj;
	}
}

function sendPack(socket, packId, packObj) {
	gLog.debug("send: %d %s", packId, JSON.stringify(packObj));
	let dataBuff = numMsg[packId].encode(packObj).finish();
	let dataBuffLen = dataBuff.length;
	let headBuff = new Buffer(8);
	/*jshint bitwise:false*/
	headBuff.writeInt32BE(packId ^ 0x79669966, 0);
	headBuff.writeInt32BE(dataBuffLen ^ 0x79669966, 4);

	if(socket.writable) {
		let buff = Buffer.concat([headBuff, dataBuff], dataBuffLen + 8);
		socket.write(buff);
	} else {
		gLog.debug("socket is unwritable");
	}

}

exports.init = init;
exports.parsePack = parsePack;
exports.sendPack = sendPack;


