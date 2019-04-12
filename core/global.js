var logMgr = require('./logMgr');

global.gConfig = {};
global.gLog = logMgr.getMainLog();
global.gAllSockets = [];//array of sockets
global.gErrors = require('./err').errors;

