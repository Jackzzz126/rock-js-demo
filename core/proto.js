let protobuf = require("protobufjs");
let async = require('async')
let msgNum = require("../" + gConfig.serverConfig.protoPath + "/MsgNum").msgNum;

let numMsg = {};//msgNum : msgObj


function init(cb1) {
	async.eachOf(msgNum, function(module, key, cb2) {
		protobuf.load(gConfig.serverConfig.protoPath + "/" + key + ".proto", function (err, root) {
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
	})
}
function parsePack(packId, packBuff) {
	let msg = numMsg[packId];
	if(!msg) {
		return null;
	} else {
		return msg.decode(packBuff);
	}
}

exports.parsePack = parsePack;
exports.init = init;


