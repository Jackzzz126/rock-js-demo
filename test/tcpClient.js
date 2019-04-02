var net = require("net");

require('./global')

var dataPacksRecved = [];
var socket = net.createConnection(8000, "127.0.0.1");
socket.on("connect", onConn);
socket.on("error", onError);
socket.on("data", onRecvData);

function onConn()
{
    socket.write("Hello");
}
function onError(err)
{
    console.log("Socket error: ", err);
}


function onRecvData(dataBuff)
{
    dataPacksRecved.push(dataBuff);
    var buff = Buffer.concat(dataPacksRecved);
    console.log("Recv data: ", buff.toString());
}

