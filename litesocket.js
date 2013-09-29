var debug = require("debug")("litesocket");
var version = require(__dirname+'/package.json').version;

var litesocket = module.exports = function(req, res, next){
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
	res.send(litesocket.welcome, {comment:litesocket.banner});

	//very important to remove it from the pool and kill off the default 2 minute timeout
	res.socket.setTimeout(0);
	res.socket.emit("agentRemove");

	if(debug.enabled){
		res.on('end', function closed(){
			debug("response closed");
		});
	}

	if(next) next();
};
litesocket.handler = function(url, callback){
	this.get(url, litesocket, callback);
};

litesocket.banner = "Connected via litesocket v"+ version +"\nhttp://npmjs.org/package/litesocket";
litesocket.welcome = '{"connected":true}';
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
	stream.write("data:");
	data = String(data).replace(/\n(?=.)/g, '\ndata: ');
	debug("data", data);
	stream.write(data);
	stream.write('\n');
};
litesocket.send = function(stream, data, options){
	if(options){
		if(options.comment){
			litesocket.sendComment(stream, options.comment);
		}
		if(options.retry){
			litesocket.sendRetry(stream, options.retry);
		}
		if(options.event){
			litesocket.sendEvent(stream, options.event);
		}
	}
	litesocket.sendData(stream, data);
	if(options && options.id){
		litesocket.sendId(stream, options.id);
	}
	stream.write('\n\n');
};
