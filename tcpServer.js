let rock = require('./rock/rock');

require('./core/global')
let proto = require('./core/proto');
let connMgr = require('./core/connMgr');
let msgNum = require(gConfig.serverConfig.protoPath + "/MsgNum").msgNum;

gLog.debug("Demo debug msg");
gLog.info("Demo info msg");
gLog.warn("Demo warn msg");
gLog.error("Demo error msg");

_initProto();
function _initProto() {
	proto.init(gConfig.serverConfig.protoPath, msgNum, function(err) {
		if(err) {
			gLog.error("Proto init error: %s", err);
			return;
		}
		_startServer();
	});
}

function _startServer() {
	rock.tcpServer.run(gConfig.serverConfig.port, connMgr.onConn);
	gLog.info("Tcp server start at %d.", gConfig.serverConfig.port);
}

