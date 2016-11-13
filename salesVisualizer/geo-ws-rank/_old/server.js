var WebSocketServer = require('websocket').server;
var WebSocketClient = require('websocket').client;
var http = require('http');
var url = "ws://geo-ws-rand.osd-demo-1.svc:8080";
var client;
var salesRegister = {};

var server = http.createServer(function(request, response) {
	console.log((new Date()) + ' Received request for ' + request.url);
	response.writeHead(200);
	response.end();
});
server.listen(8080, function() {
	console.log((new Date()) + ' Server is listening on port 8080');
});

wsServer = new WebSocketServer({
	httpServer: server,
	autoAcceptConnections: false
});

function originIsAllowed(origin) {
	return true;
}

//New connection handling
requestRegister = [ ];

function notify() {
	console.log((new Date()) + ' Object to send: ' + JSON.stringify(salesRegister));
	var delay       = Math.round((Math.random() * 2) + 2)*10;
	for(c in requestRegister) 
        requestRegister[c].send(JSON.stringify(salesRegister));
        //setTimeout(notify, delay);
}
notify();
 
wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
      request.reject();  // Make sure we only accept requests from an allowed origin
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }
    var connection = request.accept('echo-protocol', request.origin);
    console.log((new Date()) + ' Connection accepted.');

    requestRegister.push(connection);
    console.log("Connection on request: " + connection.remoteAddress);

    connection.on('close', function(reasonCode, description) {
        console.log("Connection on close: " + connection.remoteAddress);
        //Try to solve bug on disconnection
        //requestRegister = [ ];
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});

//CLient implementation

var buildWsClient = function(){
	client = new WebSocketClient();
	console.log ('New ws client built!');
	client.on('connectFailed', function(error) {
		console.log('Connect Error: ' + error.toString());
		setTimeout(function(){buildWsClient()}, 5000);
	});
	client.on('connect', function(connection) {
		console.log('WebSocket Client Connected');
		connection.on('error', function(error) {
			console.log("Connection Error: " + error.toString());
			setTimeout(function(){buildWsClient()}, 5000);
		});
		connection.on('close', function() {
			console.log('echo-protocol Connection Closed');
			setTimeout(function(){buildWsClient()}, 5000);
		});
		connection.on('message', function(message) {
			if (message.type === 'utf8') {
				console.log("Received: '" + message.utf8Data + "'");
				messageJson       = JSON.parse(message.utf8Data);
				var countryCode   = messageJson[0]["cc"];
				var saleValue     = messageJson[0]["value"];
				var actualIncome = salesRegister[countryCode] || 0;
				salesRegister[countryCode] = +actualIncome + +saleValue;
			} 
		});
	});
	client.connect(url, 'echo-protocol');
	return client;
}

buildWsClient();
//client.connect(url, 'echo-protocol');
