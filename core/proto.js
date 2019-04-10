let protobuf = require("protobufjs");
let async = require('async');
let fs = require('fs');
var hoconParser = require('hocon-parser');

let idObj = {};//packId : msgObj
let idName = {};//packId : packName

function init(protoPath, cb1) {
	fs.readFile(protoPath + '/msgId.conf', (err, data) => {
		if (err) {
			gLog.error("erorr when read msgId.confg: %s", err);
			return cb1(err);
		}
		let msgIds = null;
		try {
			msgIds = hoconParser(data.toString());
		} catch(ex) {
			gLog.error("erorr when parse msgId.confg: %s", ex);
			return cb1(new Error(ex));
		}
		async.eachOf(msgIds, function(module, key, cb2) {
			protobuf.load(protoPath + "/" + key + ".proto", function (err, root) {
				if(err) {
					gLog.error("erorr when parse %s.proto: %s", key, err);
					return cb2(err);
				}
				for(let i in module) {
					idObj[module[i][1]] = root.lookupType(module[i][0]);
					idName[module[i][1]] = module[i][0];
				}
				cb2();
			});
		}, function(err) {
			cb1(err);
		});
	});
}
function parsePack(packId, packBuff) {
	let msg = idObj[packId];
	if(!msg) {
		return null;
	} else {
		return msg.decode(packBuff);
	}
}

function sendPack(socket, packId, packObj) {
	if(!gConfig.serverConfig.noLogIds[packId]) {
		let uid = 0;
		if(socket.connData && socket.connData.uid) {
			uid = socket.connData.uid;
		}
		let packName = getPackNamById(packId);
		if(!packName) {
			packName = packId;
		}
		gLog.debug("send: %s %s %s", uid, packName, JSON.stringify(packObj));
	}
	let dataBuff = idObj[packId].encode(packObj).finish();
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

function getPackNamById(packId) {
	return idName[packId];
}

exports.init = init;
exports.parsePack = parsePack;
exports.sendPack = sendPack;
exports.getPackNamById = getPackNamById;


