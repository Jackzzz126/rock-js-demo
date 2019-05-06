let rock = require('../rock');
const async = require('async');

function ok(reqMsg, cb) {
	let resMsg = {};
	resMsg.status = gErrors.OK;
	return cb(resMsg);
}
function test(reqMsg, cb) {
	let resMsg = {};
	resMsg.status = gErrors.OK;
	return cb(resMsg);
}

function heartBeat(reqMsg, cb) {
	let resMsg = {};
	resMsg.status = gErrors.OK;
	return cb(resMsg);
}

function login(reqMsg, cb) {
	let resMsg = {};
	let curTime = rock.time.curTimeMs();
	let sid = rock.comm.randStr(32);

	async.waterfall([
		function(done) {
			gRedisClient.send_command("set", [gRedisPrefix.session + sid, reqMsg.uid,  "EX", gConfig.serverConfig.session.ttl], onSetSid);
			function onSetSid(err, reply) {
				if(err) {
					resMsg.status = gErrors.COMM_CACHE_ERROR;
					resMsg.status.params = "redis error " + err;
					return done(resMsg.status);
				} else {
					return done();
				}
			}
		},
		function(done) {
			let sObj = {};
			sObj.sid = sid;
			sObj.time = curTime;
			sObj.hospId = reqMsg.hospId;
			sObj.deptId = reqMsg.deptId;
			sObj.name = reqMsg.name;

			gRedisClient.send_command("set", [gRedisPrefix.sessionObj + reqMsg.uid, JSON.stringify(sObj),  "EX", gConfig.serverConfig.session.ttl], onSetUid);

			function onSetUid(err, reply) {
				if(err) {
					resMsg.status = gErrors.COMM_CACHE_ERROR;
					resMsg.status.params = "redis error " + err;
					return done(resMsg.status);
				} else {
					resMsg.status = gErrors.OK;
					resMsg.sid = sid;
					return done();
				}
			}
		},
	], function(err, result) {
		return cb(resMsg);
	});
}

exports.ok = ok;
exports.test = test;
exports.heartBeat = heartBeat;
exports.login = login;

