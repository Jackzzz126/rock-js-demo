let rock = require('./rock/rock');

require('./core/global')
let proto = require('./core/proto');
let connMgr = require('./core/connMgr');

gLog.debug("Demo debug msg");
gLog.info("Demo info msg");
gLog.warn("Demo warn msg");
gLog.error("Demo error msg");

_initProto();
function _initProto() {
	proto.init(function(err) {
		if(err) {
			gLog.error("Proto init error: %s", err);
			return;
		}
		_startServer();
	});
}

function _startServer() {
	rock.tcpServer.run(8000, connMgr.onConn);
	gLog.info("Tcp server start at %d.", gConfig.serverConfig.port);
}

