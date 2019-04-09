require('../core/global');
let proto = require('../core/proto');
//let async = require('async');
let fs = require('fs');
var hoconParser = require('hocon-parser');

let userMgr = require('./userMgr');

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
				for(let i in config) {
					gConfig[i] = config[i];
				}
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
		user1.conn(gConfig.serverConfig.port, "127.0.0.1", function() {
			done();
		});
	});
});


