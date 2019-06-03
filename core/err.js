exports.errors = {
	"OK" : {"code" : 0, "msg" : "OK"},
	// >1, error
	// 1 - 1000 通用错误
	"COMM_SESSION_ERROR" : {"code" : 1, "msg" : "session错误, 请重新登录"},
	"COMM_DB_ERROR" : {"code" : 2, "msg" : "未知数据库错误"},
	"COMM_CACHE_ERROR" : {"code" : 3, "msg" : "未知缓存错误"},
	"COMM_PARSE_PACK_ERROR" : {"code" : 4, "msg" : "解析数据包错误"},
};
