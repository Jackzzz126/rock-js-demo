describe("Cleanup", function() {
	before(function() {
	});
	it("CloseSocket", function(done){
		for(let i in gUsers) {
			gUsers[i].close();
		}
		done();
	});
});


