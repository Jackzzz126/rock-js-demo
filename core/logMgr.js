var bunyan = require('bunyan');

function getMainLog(logPath, logName) {
	var log = bunyan.createLogger({
		name: logName,
		streams: [
			{
				stream : process.stdout,
				level : 'trace',
			},
			{
				type: 'rotating-file',
				path: logPath + '/' + logName + '.log',
				period: '1d',   // daily rotation
				count: 9999,
				level: 'debug',
			},
			{
				type: 'rotating-file',
				path: logPath + '/' + logName + '_err.log',
				period: '1d',   // daily rotation
				count: 9999,
				level: 'warn',
			},
		]
	});
	return log;
}

function getConsoleLog() {
	var log = bunyan.createLogger({
		name: 'main',
		streams: [
			{
				stream : process.stdout,
				level : 'trace',
			},
		]
	});
	return log;
}

exports.getMainLog = getMainLog;
exports.getConsoleLog = getConsoleLog;

