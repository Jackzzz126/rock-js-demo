var assert = require("assert");

let user1 = null;
describe("Init", function() {
	before(function() {
		user1 = gUsers[0];
	});
	it("HeartBeat", function(done){
		let reqMsg = {};
		reqMsg.code = 1;
		user1.sendPack(1001, reqMsg);
		user1["1002"] = function(resMsg) {
			assert.ok(resMsg.status.code === 0);
			done();
		};
	});
});


