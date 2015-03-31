litesocket
==========

Stop using Socket.io for one-way communication!

The W3C has created the [Server-Sent Event](http://dev.w3.org/html5/eventsource/) specification for
doing "push notifications" in a very simple & http compatable way. (no need to `UPGRADE` the connection)

Don't believe it is simple? Open litesocket.js and see for yourself!

```javascript
var litesocket = require("litesocket");
var http = require('http');
http.createServer(function (req, res) {
	litesocket(req, res, function(){
		res.send("Hello World");
		//DO NOT CALL res.end()!
	})
})
.listen(3000);
```

### connect/express middleware
A middleware function is returned when your call `require("litesocket")`. The middleware sets up the plumbing
needed to send events to Node's response streams.

The default `res.send` function is overridden for sending SSE data.

#### res.send(data [,options])
*`data`* is any string you want to send.<br>
*`options`* is an _(optional)_ object you can provide with `id`, `event`, `comment`, or `retry` message options.

```javascript
var litesocket = require("litesocket");
var express = require('express');
var app = express();

app.get('/', litesocket, function(req, res){
	res.send("Hello World", {
		event: "shout"
	});
});

app.listen(3000);
```

### handler(url, callback)
Gives you some syntatic sugar if you want it.

```javascript
var express = require('express');
var app = express();
app.sse = require("litesocket").handler;

app.sse('/', function(req, res){
	res.send("Hello World");
});

app.listen(3000);
```


#### welcome
On establishing a connection, a welcome comment is sent.<br>
_default: "You are connected"_

#### headers(res)
Allows you to override/customize the response headers that are sent.

### Bare stream writers
They do what you would expect. See the [Server-Sent Event](http://dev.w3.org/html5/eventsource/) spec for details
#### sendId(stream, id)
#### sendEvent(stream, name)
#### sendRetry(stream, ms)
#### sendComment(stream, comment)
#### sendData(stream, data)
#### send(stream, data, options)
A helper function that allows you to combine several actions.


license
=======
The MIT License (MIT)

Copyright (c) 2013 William Kapke

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
