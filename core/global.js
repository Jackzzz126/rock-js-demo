var log4js = require('./log4js');

//--------------------------gConfig--------------------------------------------
global.gConfig = {};
gConfig.logConfig = {
	'name' : 'main',
	'level' : 'debug',//debug
	//'level' : 'info',//release
};
gConfig.serverConfig = {
	'port' : 8000,
	'protoPath' : './proto'
};

//--------------------------gLog--------------------------------------------
global.gLog = log4js.createLog();
gLog.setLevel(gConfig.logConfig.level);

