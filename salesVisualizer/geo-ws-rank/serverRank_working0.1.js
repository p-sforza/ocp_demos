// Simple ws Server that:
//   - as a client:
//     - join a ws server into channelRoom channel
//     - catch "sale" events
//     - sum country sales
//     - save the hystory of sales into a sales register (salesRegister)
//   - as a server:
//     - catch salesRegister update
//     - calculate country ranking
//     - provide country ranking (for sales) to ws client connected into the rankRoom

var wsUri = 'http://localhost:3000';
var registerFile = 'salesRegister.json';
var fs = require("fs");
var client = require('socket.io-client');
var clientIn = client.connect(wsUri);

//- This write an empty sales register if it does not exist and init the salesRegister obj

if (fs.existsSync(registerFile)) {
  console.log('Existing salesRegister!');
} else {
  console.log('Creating empty salesRegister!');
  fs.writeFileSync(registerFile, '{}');
}
var salesRegister = fs.readFileSync(registerFile);
var salesRegister = JSON.parse(salesRegister);

//---------------------------------------

//--- WS Client Section ---------------\\
// This setup ws connection, elaborate the sales register and save it

clientIn.on('channelRoom', function(message) {
  console.log((new Date()) + ' [...] Recived Msg: ' + message);
  if (message) {
    messageJson       = JSON.parse(message);
    var countryCode   = messageJson[0]["cc"];
    var saleValue     = messageJson[0]["value"];
    var actualIncome = salesRegister[countryCode] || 0;
    salesRegister[countryCode] = +actualIncome + +saleValue;
    console.log((new Date()) + ' New Sales Register: ' + JSON.stringify(salesRegister));
    fs.writeFile(registerFile, JSON.stringify(salesRegister));
    salesRegisterUpdate()
  };
});

//---------------------------------------

//--- WS Server Section ---------------\\
// This ....

var io   = require('socket.io')();
var serverPort = 3001;
io.listen(serverPort, function(){
  console.log((new Date()) + ' [http.listen] listening on *:' + serverPort);
});

io.on('connection', function(socket){
  console.log((new Date()) + ' [io.on] A new user connected');
  //io.emit('rankRoom', 'Hello World!');

  socket.on('rankRoom', function(msg){
    console.log((new Date()) + ' [io.on(connection, rankRoom)] Broadcasting recived Msg: ' + JSON.stringify(msg));
    io.emit('rankRoom', msg);

  });
  socket.on('disconnect', function () {
    console.log((new Date()) + ' [io.on.socket.on(disconnect)] A user disconnected');
  });
});

function salesRegisterUpdate() {
  //io.emit('rankRoom', JSON.stringify(salesRegister));
  var sortable = [];
  for (var country in salesRegister)
    sortable.push([country, salesRegister[country]])
  sortable.sort(
    function(a, b) {
        return a[1] - b[1]
    });
  console.log((new Date()) + ' [salesRegisterUpdate] ... : ' + sortable);
}

