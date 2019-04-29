var assert = require("assert");
let rock = require('../rock');
let proto = require('../core/proto');
let httpUtil = require('./httpUtil');

let reqMsg = {};
reqMsg.x = 1;
reqMsg.y = 2;
reqMsg.z = 3;
let opts = {};
opts.host = "127.0.0.1";
opts.path = "/test";
describe("Http test", function() {
	before(function() {
		opts.port = gConfig.serverConfig.httpPort;
	});
	it("HttpGet", function(done){
		opts.method = "GET";
		rock.httpUtil.httpRequest(opts, reqMsg, (err, resBuff) => {
			let resMsg = JSON.parse(resBuff);
			assert.ok(resMsg.status.code === 0);
			done();
		});
	});
	it("HttpPost", function(done){
		opts.method = "POST";
		rock.httpUtil.httpRequest(opts, reqMsg, (err, resBuff) => {
			let resMsg = JSON.parse(resBuff);
			assert.ok(resMsg.status.code === 0);
			done();
		});
	});
	it("HttpProto", function(done){
		opts.method = "POST";
		opts.path = "/bin";
		let reqMsg2 = {};
		reqMsg2.code = 1;
		let dataBuff = proto.formBuff(1001, reqMsg2);
		rock.httpUtil.httpRequest(opts, dataBuff, (err, resBuff) => {
			let resMsg = httpUtil.parseBuff(resBuff);
			assert.ok(resMsg.status.code === 0);
			done();
		});
	});
});


