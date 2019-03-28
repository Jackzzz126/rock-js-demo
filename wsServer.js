var rock = require('./rock/rock');

function onConn(socket, req) {
	var addressStr = req.connection.remoteAddress;
	if(addressStr) {
		addressStr = addressStr.substr(addressStr.lastIndexOf(":") + 1);
		addressStr += ":" + req.connection.remotePort;
		console.log(addressStr);
	}

	let pathStr = req.url.substring(1, req.url.lastIndexOf("?"));
	console.log(pathStr);

	socket.on('message', function(dataBuff) {
		console.log("Receive %s from %s", dataBuff, addressStr);
	});

	socket.on('error', function(err) {
		console.log(addressStr, err);
	});

	socket.on('close', function(code, msg){
		console.log(addressStr, code);
	});
}

rock.wsServer.run(8000, onConn);
console.log("Ws server start at 8000");

//rock.wsServer.run(8001, onConn,
//		'./https_keys/1_yx-tuya.philm.cc_bundle.crt',
//		'./https_keys/2_yx-tuya.philm.cc.key'
//		);
//console.log("Wss server start at 8001");


