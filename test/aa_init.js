//let async = require('async');
let fs = require('fs');
var hoconParser = require('hocon-parser');

let rock = require('../rock');
require('../core/global');
let proto = require('../core/proto');
let userMgr = require('./userMgr');
var logMgr = require('../core/logMgr');

global.gLog = logMgr.getConsoleLog();
global.gUsers = [];

describe("Init", function() {
	before(function() {
	});
	it("config init", function(done){
		fs.readFile('./core/config.conf', (err, data) => {
			if (err) {
				done(err);
			}
			try {
				let config = hoconParser(data.toString());
				gConfig.serverConfig = rock.comm.expendObj(config.serverConfig, config.dev);
				gLog.setLevel(gConfig.serverConfig.logLevel);
				done();
			} catch(ex) {
				done(err);
			}
		});
	});
	it("proto init", function(done){
		proto.init(gConfig.serverConfig.protoPath, function(err) {
			if(err) {
				gLog.error("Proto init error: %s", err);
			}
			done();
		});
	});
	it("init conn", function(done){
		let user1 = userMgr.newUser();
		gUsers.push(user1);
		user1.conn(gConfig.serverConfig.tcpPort, "127.0.0.1", function() {
			done();
		});
	});
});


