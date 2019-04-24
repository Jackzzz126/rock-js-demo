var assert = require("assert");

let proto = require('../core/proto');

function parseBuff(resBuff) {
	let headLen = 8;
	let buffLen = resBuff.length;
	assert.ok(buffLen >= headLen);
	/*jshint bitwise:false*/
	let packId = resBuff.readInt32BE(0) ^ 0x79669966;
	let packLen = resBuff.readInt32BE(4) ^ 0x79669966;
	assert.ok((packLen + headLen) === buffLen);
	let packBuff = resBuff.slice(headLen, headLen + packLen);
	let resObj = proto.parsePack(packId, packBuff);
	return resObj;
}
exports.parseBuff = parseBuff;
