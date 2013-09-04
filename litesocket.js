var debug = require("debug")("litesocket");

exports = module.exports = function(req, res, next){
	debug("connection opened");
	res.writeHead(200, exports.headers(req));
	["sendRetry","sendComment","sendData"].forEach(function(name){
		var fn = exports[name];
		res[name] = function(val){
			fn(res, val);
		};
	});
	res.send = function(data, options){
		exports.send(res, data, options);
	};

	//send something or the browser gets mad!
	res.sendComment(exports.welcome);

	//very important to remove it from the pool and kill off the default 2 minute timeout
	req.socket.setTimeout(0);
	req.socket.emit("agentRemove");
	req.on('close', function(){
		debug("connection closed");
	});

	next();
};

exports.welcome = "You are connected";
exports.headers = function(res){
	return {
		"Access-Control-Allow-Origin": "*",
		"Content-Type":"text/event-stream",
		"Cache-Control":"no-cache",
		"Connection":"keep-alive"
	};
}
exports.sendId = function(stream, id){
	debug("id: ", id);
	stream.write("id:");
	stream.write(String(id));
	stream.write('\n');
};
exports.sendEvent = function(stream, name){
	debug("event:", name);
	stream.write("event:");
	stream.write(String(name));
	stream.write('\n');
};
exports.sendRetry = function(stream, ms){
	debug("retry:", ms);
	stream.write("retry:");
	stream.write(String(ms));
	stream.write('\n');
};
exports.sendComment = function(stream, comment){
	debug(":", comment);
	stream.write(":");
	stream.write(String(comment).replace(/\n(?=.)/g, '\n:'));
	stream.write('\n');
};
exports.sendData = function(stream, data){
	data = String(data).replace(/\n(?=.)/g, '\ndata: ');
	stream.write("data:");
	debug(data);
	stream.write(data);
	if(/\n\r?\n\r?$/.test(data))//the data already has the terminating \n\n at the end
		return;
	stream.write(/\n\r?$/.test(data)? '\n':'\n\n');
};
exports.send = function(stream, data, options){
	if(options){
		if(options.comment){
			exports.sendComment(stream, options.comment);
		}
		if(options.retry){
			exports.sendRetry(stream, options.retry);
		}
		if(options.id){
			exports.sendId(stream, options.id);
		}
		if(options.event){
			exports.sendEvent(stream, options.event);
		}
	}
	if(data)
		exports.sendData(stream, data);
};
exports.handler = function sseHandler(url, callback){
	this.get(url, exports, callback);
};
