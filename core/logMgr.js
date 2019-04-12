var bunyan = require('bunyan');

function getMainLog() {
	var log = bunyan.createLogger({
		name: 'main',
		streams: [
			{
				stream : process.stdout,
				level : 'trace',
			},
			{
				type: 'rotating-file',
				path: './logs/main.log',
				period: '1d',   // daily rotation
				count: 9999,
				level : 'debug',
			},
			{
				type: 'rotating-file',
				path: './logs/main_err.log',
				period: '1d',   // daily rotation
				count: 9999,
				level : 'warn',
			},
		]
	});
	return log;
}

exports.getMainLog = getMainLog;

