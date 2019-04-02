//1-1000 系统保留
//1001 - 10000 请求，返回
//请求接口+1 == 返回接口号
//大厅接口，建议每个模块占用100或100以上，方便扩展
//10001 - 20000 单项通知

//其他约定
//1. 请求已Req结尾，回报以Res结尾
//2. 单向通知，统一以Sync结尾
//3. 单向通知和res，第一个字段是status对象)
let msgNum = {
	"Common" : [
		["HeartBeatReq" , 1001],
		["HeartBeatRes" , 1002],
	]
}

exports.msgNum = msgNum;
