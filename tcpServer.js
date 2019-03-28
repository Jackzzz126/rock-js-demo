var rock = require('./rock/rock');

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
console.log("Tcp server start at 8000");

