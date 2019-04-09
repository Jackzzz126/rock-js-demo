var util = require('util');
var log4js = require('log4js');

function createLog() {
	let log = {};
	log._logger = log4js.getLogger("main");
	log._loggerError = log4js.getLogger("error");

	log.debug = function(){
		this._logger.debug(util.format.apply(null, arguments));
	};
	log.info = function(){
		this._logger.info(util.format.apply(null, arguments));
	};
	log.warn = function(){
		let errStr = util.format.apply(null, arguments);
		this._logger.warn(errStr);
		this._loggerError.warn(errStr);
	};
	log.error = function(){
		if(typeof(arguments[0]) === "string") {
			let errStr = util.format.apply(null, arguments);
			let err = new Error(errStr);
			this._logger.error(err);
			this._loggerError.error(err);
		} else {
			this._logger.error(arguments[0]);
			this._loggerError.error(arguments[0]);
		}
	};

	log.setLevel = function(level) {
		log._logger.level = level;
		log._loggerError.level = level;
	};

	return log;
}

log4js.configure({
	appenders: {
		console: {type: 'console'},
		dateFileMain: {
			type: 'dateFile',
			filename: 'logs/main',
			pattern : "_yyyyMMddhh.log",
			maxLogSize : 1024 * 1024 * 1024,
			alwaysIncludePattern: true,
		},
		dateFileError: {
			type: 'dateFile',
			filename: 'logs/error',
			pattern : "_yyyyMMddhh.log",
			maxLogSize : 1024 * 1024 * 1024,
			alwaysIncludePattern: true,
		},
	},
	categories: {
		default: { appenders: ['console'], level: 'all' },
		main: { appenders: ['console', 'dateFileMain'], level: 'all' },
		error: { appenders: ['dateFileError'], level: "all" },
		console: { appenders: ['console', 'dateFileMain'], level: "all"},
	}
});

// replace console.log
const consoleLogger = log4js.getLogger("console");
console.log = consoleLogger.info.bind(consoleLogger);

exports.createLog = createLog;
