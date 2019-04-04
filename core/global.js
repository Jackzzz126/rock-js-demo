var rock = require('../rock');
var log4js = require('log4js');

//--------------------------gConfig--------------------------------------------
global.gConfig = {};
gConfig.logConfig = {
	'name' : 'main',
	'level' : 'debug',//debug
	//'level' : 'info',//release
};
gConfig.serverConfig = {
	'port' : 8080,
	'protoPath' : './proto'
};

//--------------------------gLog--------------------------------------------
global.gLog = rock.log4js.createLog(gConfig.logConfig.name);

log4js.configure({
	appenders: {
		console: {type: 'console'},
		dateFileMain: {
			type: 'dateFile',
			filename: 'logs/main',
			pattern : "_yyyyMMddhh.log",
			maxLogSize : 1024 * 1024 * 1024,
			alwaysIncludePattern: true,
		}
	},
	categories: {
		default: { appenders: ['console'], level: 'all' },
		main: { appenders: ['console', 'dateFileMain'], level: gConfig.logConfig.level }
	}
});

