var debug = require("debug")("litesocket");

litesocket = module.exports = function(req, res, next){
	debug("connection opened");
	res.useChunkedEncodingByDefault = false;
	res.writeHead(200, litesocket.headers(req));
	["sendRetry","sendComment","sendData"].forEach(function(name){
		var fn = litesocket[name];
		res[name] = function(val){
			fn(res, val);
		};
	});
	res.send = function(data, options){
		litesocket.send(res, data, options);
	};

	//send something or the browser gets mad!
	res.send(litesocket.welcome);

	//very important to remove it from the pool and kill off the default 2 minute timeout
	res.socket.setTimeout(0);
	res.socket.emit("agentRemove");

	if(debug.enabled){
		res.on('end', function closed(){
			debug("response closed");
		});
	}

	next();
};
litesocket.handler = function(url, callback){
	this.get(url, litesocket, callback);
};

litesocket.welcome = "You are connected";
litesocket.headers = function(res){
	return {
		"Access-Control-Allow-Origin": "*",
		"Content-Type":"text/event-stream",
		"Cache-Control":"no-cache"
	};
}
litesocket.sendId = function(stream, id){
	debug("id: ", id);
	stream.write("id:");
	stream.write(String(id));
	stream.write('\n');
};
litesocket.sendEvent = function(stream, name){
	debug("event:", name);
	stream.write("event:");
	stream.write(String(name));
	stream.write('\n');
};
litesocket.sendRetry = function(stream, ms){
	debug("retry:", ms);
	stream.write("retry:");
	stream.write(String(ms));
	stream.write('\n');
};
litesocket.sendComment = function(stream, comment){
	debug(":", comment);
	stream.write(":");
	stream.write(String(comment).replace(/\n(?=.)/g, '\n:'));
	stream.write('\n');
};
litesocket.sendData = function(stream, data){
	data = String(data).replace(/\n(?=.)/g, '\ndata: ');
	stream.write("data:");
	debug(data);
	stream.write(data);
	if(/\n\r?\n\r?$/.test(data))//the data already has the terminating \n\n at the end
		return;
	stream.write(/\n\r?$/.test(data)? '\n':'\n\n');
};
litesocket.send = function(stream, data, options){
	if(options){
		if(options.comment){
			litesocket.sendComment(stream, options.comment);
		}
		if(options.retry){
			litesocket.sendRetry(stream, options.retry);
		}
		if(options.id){
			litesocket.sendId(stream, options.id);
		}
		if(options.event){
			litesocket.sendEvent(stream, options.event);
		}
	}
	if(data)
		litesocket.sendData(stream, data);
};
