// Simple ws Server that generate a "sale" event and push messages to all client into channelRoom channel

var app  = require('express')(); // just for idex page for debug purpose
var http = require('http').Server(app);
var serverPort =      process.env.MY_SERVER_PORT      || 8080;

//var serverContext =   process.env.MY_SERVER_CONTEXT   || '/ws';
//var io   = require('socket.io')(http, { path: serverContext});
var io   = require('socket.io')(http);


//--- Http Section ---------------\\
// This provide a simple index.html to test ws connection
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

http.listen(serverPort, function(){
  console.log((new Date()) + ' [http.listen] listening on: ' + serverPort);
});

//--------------------------------\\


//--- Websocket Server Section ---\\
// This provide a ws server with an event interface into createSaleMsg function
// For each sales the event is broadcasted to all client in channelRoom

io.on('connection', function(socket){
  console.log((new Date()) + ' [io.on] A new user connected');
  socket.on('channelRoom', function(msg){
    console.log((new Date()) + ' [io.on(connection, channelRoom)] Broadcasting recived Msg: ' + JSON.stringify(msg));
    io.emit('channelRoom', msg);
  });
  socket.on('disconnect', function () {
    console.log((new Date()) + ' [io.on.socket.on(disconnect)] A user disconnected');
  });
});

function createSaleMsg() {
  var countryCode  = Math.round(Math.random() * 0x64);
  var countryColor = "#f00"; // Country in red!
  var delay        = Math.round((Math.random() * 2) + 2)*1000;
  var saleValue    = Math.round((Math.random() * 1000) + 1);

  sale = []; // Just empty the array at any cycle

  sale.push ({
    "cc": countryCode.toString(),
    "countryColor": countryColor,
    "value": saleValue.toString()
  });
  console.log((new Date()) + ' [createSaleMsg] Sale Obj: ' + JSON.stringify(sale));
  io.emit('channelRoom', JSON.stringify(sale));
  setTimeout(createSaleMsg, delay);
}
createSaleMsg();

