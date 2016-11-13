var WebSocketServer = require('websocket').server;
var http = require('http');
const util = require('util');

var server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
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
	var countryCode = Math.round(Math.random() * 0x64);
	//var countryColor = "#24179E"; // Country in blue
 	var countryColor = "#f00"; // Country in red!
	var delay       = Math.round((Math.random() * 2) + 2)*1000;
	var saleValue   = Math.round((Math.random() * 1000) + 1);
	var sales       = [];
	
	sales.push ({
        "cc": countryCode.toString(),
        "countryColor": countryColor,
        "value": saleValue.toString()
    });
	console.log((new Date()) + ' Object: ' + JSON.stringify(sales));
	
	for(c in requestRegister) 
        requestRegister[c].send(JSON.stringify(sales));
	    setTimeout(notify, delay); //Introduce a rand delay
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