let rock = require('./rock');
let fs = require('fs');
var hoconParser = require('hocon-parser');
let async = require('async');

require('./core/global');
let proto = require('./core/proto');
let connMgr = require('./core/connMgr');

gLog.debug("Demo debug msg");
gLog.info("Demo info msg");
gLog.warn("Demo warn msg");
gLog.error("Demo error msg");
console.log("Demo console log");

async.waterfall([
	function(cb) {
		fs.readFile('./core/config.conf', (err, data) => {
			if (err) {
				gLog.error("error when read config.conf: %s", err);
				return cb(err);
			}
			try {
				let config = hoconParser(data.toString());
				for(let i in config) {
					gConfig[i] = config[i];
				}
				gLog.setLevel(gConfig.serverConfig.logLevel);
				return cb();
			} catch(ex) {
				gLog.error("error when parse config.conf: %s", ex);
				return cb(new Error(ex));
			}
		});
	},
	function(cb) {
		proto.init(gConfig.serverConfig.protoPath, function(err) {
			if(err) {
				gLog.error("Proto init error: %s", err);
				return cb(err);
			}
			return cb();
		});
	},
	function(cb) {
		rock.tcpServer.run(gConfig.serverConfig.port, connMgr.onConn);
		gLog.info("Tcp server start at %d.", gConfig.serverConfig.port);
		return cb();
	},
	function(cb) {
		setInterval(function() {
			let curTimeMs = rock.time.curTimeMs();
			let timeOut = gConfig.serverConfig.connTimeout * 1000;
			for(let i in gAllSockets) {
				let connData = gAllSockets[i].connData;
				if((curTimeMs - connData.lat) > timeOut) {
					if(connData.uid) {
						gLog.debug("%s exit by timeout", connData.uid);
					}
					gAllSockets[i].end();
					connData.connData.closed = true;
					gAllSockets.splice(i, 1);
				}
			}
		}, 3 * 1000);
		return cb();
	},
], function( err, result) {
	if(err) {
		process.exit(1);
	}
});

