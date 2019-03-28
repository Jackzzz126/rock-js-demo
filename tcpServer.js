var rock = require('./rock/rock');
require('./config')
require('./log')

gLog.debug("Demo debug msg");
gLog.info("Demo info msg");
gLog.warn("Demo warn msg");
gLog.error("Demo error msg");

function onConn(socket) {
    console.log("Client connected: " + socket.remoteAddress + ":" + socket.remotePort);

    var dataPacksRecved = [];

	socket.on("data", onRecvData);
	socket.on("error", onSocketError);
	socket.on("close", onSocketClose);
	socket.on("timeout", onSocketTimeout);
	function onRecvData(dataBuff)
	{
		socket.setNoDelay(true);

		dataPacksRecved.push(dataBuff);
        var buff = Buffer.concat(dataPacksRecved);
        console.log("Recv data: ", buff.toString());
        socket.write("world");
	}
	
	function onSocketError(err)
	{
        console.log("Socket error: ", err);
	}
	function onSocketClose(hasError)
	{
        console.log("Socket close: ", hasError);
	}
	function onSocketTimeout()
	{
		socket.end();
        console.log("Socket time out.");
	}
}

rock.tcpServer.run(8000, onConn);
gLog.info("Tcp server start at %d.", gConfig.serverConfig.port);

