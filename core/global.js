var log4js = require('./log4js');

//--------------------------gConfig--------------------------------------------
global.gConfig = {};

//--------------------------gLog--------------------------------------------
global.gLog = log4js.createLog();

//--------------------------gAllSockets--------------------------------------------
global.gAllSockets = [];//array of sockets
