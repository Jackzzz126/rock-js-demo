var rock = require('./rock/rock');
var log4js = require('log4js');

/*global gLog : true */
global.gLog = rock.log4js.createLog("main");
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
		main: { appenders: ['console', 'dateFileMain'], level: 'debug' }
	}
});

gLog.debug("This is debug msg");
gLog.info("This is info msg");
gLog.warn("This is warn msg");
gLog.error("This is error msg");

