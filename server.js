var express = require('express'),
	app = express(),
	users=[],
    fs=require('fs'),
	
	// http = require('http'), 
    // url = require('url'), 
    // path = require('path'), 
    // os = require('os'),
	emojiArray=[],

	server = require('http').createServer(app),
    io = require('socket.io').listen(server); //引入socket.io模块并绑定到服务器

	// function getIPv4(){ 
	// 	var interfaces = os.networkInterfaces();//获取网络接口列表 
	// 	var ipv4s = [];//同一接口可能有不止一个IP4v地址，所以用数组存
	// 	Object.keys(interfaces).forEach(function (key){
	// 		interfaces[key].forEach(function (item){
		
	// 			//跳过IPv6 和 '127.0.0.1'
	// 			if ( 'IPv4' !== item.family || item.internal !== false )return;
		
	// 			ipv4s.push(item.address);//可用的ipv4s加入数组
	// 			console.log(key+'--'+item.address);
	// 		})        
	// 	})
		
	// 	return ipv4s[0];//返回一个可用的即可
	// }		

	// var mime = { 
	// 	"html": "text/html", 
	// 	"htm": "text/html", 
	// 	"css": "text/css", 
	// 	"js": "text/javascript", 
	// 	"xml": "text/xml", 
	// 	"json":"application/json",
	// 	// --------------------- 
	// 	// 作者：jimtrency 
	// 	// 来源：CSDN 
	// 	// 原文：https://blog.csdn.net/jimtrency/article/details/69569212 
	// 	// 版权声明：本文为博主原创文章，转载请附上博文链接！
	// 	"jpg": "image/jpeg",
    //     "jpeg": "image/jpeg",
	// 	"png": "image/png",
	// 	"gif": "image/gif",
	// 	"bmp": "image/bmp",
	// 	"svg": "image/svg+xml",
	// 	"ico": "image/x-icon",

	// 	"mp3": "audio/mpeg",
	// 	"wav": "audio/x-wav",
	// 	"mp4": "video/mp4",
	// 	"swf": "application/x-shockwave-flash",

	// 	"woff": "application/x-font-woff"
	// 	}



	// var server = http.createServer(function (req,res){
	// 		var pathname = url.parse(req.url).pathname;;
	// 		var filename = 'D:/WebStorm_WorkPace/potted_plant'+pathname;
	// 		var extname = path.extname(filename);

	// 		//扩展名含点号如'.html',截掉
	// 		extname = extname ? extname.slice(1) : 'unknown';
	// 		//映射表中查找请求的资源的MIME类型并返回，没有映射均返回'text/plain'类型
	// 		var resContentType = mime[extname] || 'text/plain';

	// 		fs.exists(filename,function (exists){
	// 		if (!exists){
	// 			//文件不存在返回404
	// 			res.writeHead(404,{'Content-Type':'text/plain'});
	// 			res.write('404 Not Found');
	// 			res.end();
	// 		}else {
	// 			//文件存在读取并返回
	// 			fs.readFile(filename,function (err,data){
	// 				if (err){
	// 					res.writeHead(500,{'Content-Type':'text/plain'});
	// 					res.end(err);
	// 				}else{
	// 					res.writeHead(200,{'Content-Type':resContentType});
	// 					res.write(data);
	// 					res.end();
	// 				}
	// 			})
	// 		}
	// 	})

    // })








   
app.use('/', express.static(__dirname));
server.listen(3000,function () {
	console.log('服务器已经启动');
});
const files=fs.readdirSync(__dirname+'/images/chat-tool/emoji');
files.forEach(function(item,index){
	emojiArray.push(item);//获取表情包路径
});

//socket部分
io.on('connection', function(socket) {
    //接收并处理客户端发送的foo事件
    socket.on('login',function(nickname){
    	if(users.indexOf(nickname)>-1){
    		socket.emit('nickExisted');
    	}
    	else{
    		socket.userIndex=users.length;
	    	socket.nickname=nickname;
	    	users.push(nickname);
	    	socket.emit('loginSuccess',users,emojiArray);
	    	socket.broadcast.emit('someoneLogin',nickname,users);

    	}
    });
    socket.on('disconnect',function(){
        if(!socket.nickname)
            return;
    	for(let i=0;i<users.length;i++){
    		if(users[i]==socket.nickname){
    			users.splice(i,1);
    		}
    	}
    	socket.broadcast.emit('someoneLogout',socket.nickname,users);//通知除自己外所有人
    });
    socket.on('sendMessage',function(message){//发送消息
    	socket.broadcast.emit('someoneSendMessage',socket.nickname,message);
    });
    socket.on('sendEmoji',function(imgSrc){//发送表情包
    	socket.broadcast.emit('someoneSendEmoji',socket.nickname,imgSrc);
    });
});