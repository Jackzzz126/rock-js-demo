var log4js = require('./log4js');

global.gConfig = {};
global.gLog = log4js.createLog();
global.gAllSockets = [];//array of sockets
global.gErrors = require('./err').errors;

