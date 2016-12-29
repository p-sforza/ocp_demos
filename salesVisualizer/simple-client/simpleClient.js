// Simple ws client to printout ws msgs for debug
// Alternatively use: 
// wscat -c ws://<WS_IP>:<WS_PORT>/socket.io/\?transport=websocket

var wsUri = 'http://wsrand.yoox.novalocal:80';
//var channel = 'rankRoom';
//var channel = 'rankArrayRoom';
var channel = 'channelRoom';

var client = require('socket.io-client');
var clientIn = client.connect(wsUri);

clientIn.on(channel, function(message) {
  console.log((new Date()) + ' [...] Recived Msg: ' + message);
});
