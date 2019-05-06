global.gConfig = {};
global.gAllSockets = [];//array of sockets
global.gErrors = require('./err').errors;

global.gRedisClient = null;

global.gRedisPrefix = {
	sessionObj : "sobj_",//+uid : sobj
	/*
	{
		sid
		time
		hospId
		deptId
		name
	}
	*/
	session : "s_",//+sid : uid
};

