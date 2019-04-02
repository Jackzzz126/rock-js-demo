var net = require("net");

require('../core/global')
let proto = require('../core/proto')
let msgNum = require("../" + gConfig.serverConfig.protoPath + "/MsgNum").msgNum;

let userMgr = require('./userMgr')

global.gUsers = [];

describe("Init", function() {
	before(function() {
	});
	it("proto init", function(done){
		proto.init(gConfig.serverConfig.protoPath, msgNum, function(err) {
			if(err) {
				gLog.error("Proto init error: %s", err);
			}
			done();
		});
	});
	it("init conn", function(done){
		let user1 = userMgr.newUser();
		gUsers.push(user1);
		user1.conn(gConfig.serverConfig.port, "127.0.0.1", function() {
			done();
		});
	});
});


