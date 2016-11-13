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
//  The register will have this form:
//  salesRegister = {"37":[{"cc":"37","countryColor":"#f00","value":"2000"}],"59":[{"cc":"59","countryColor":"#f00","value":"1000"}]};
//

if (fs.existsSync(registerFile)) {
  console.log('Existing salesRegister!');
} else {
  console.log('Creating empty salesRegister!');
  fs.writeFileSync(registerFile, '{"0":[{"cc":"0","countryColor":"#f00","value":"0"}]}');
}
var salesRegister = fs.readFileSync(registerFile);
salesRegister = JSON.parse(salesRegister);
console.log((new Date()) + ' SalesRegister now is: ' + salesRegister);
console.log((new Date()) + '   catch curr value: ' + salesRegister[0][0]["value"]);


//---------------------------------------

//--- WS Client Section ---------------\\
// This setup ws connection, elaborate the sales register and save it

clientIn.on('channelRoom', function(message) {
  console.log((new Date()) + ' [...] Recived Msg: ' + message);
  if (message) {
    messageJson       = JSON.parse(message);
    //console.log((new Date()) + ' MSG Arrived: ' + messageJson);
    var countryCode   = messageJson[0]["cc"];
    var saleValue     = messageJson[0]["value"];
    console.log((new Date()) + 'Curr countryCode: ' + countryCode); 
    console.log((new Date()) + 'Curr salesRegister: ' + JSON.stringify(salesRegister));
    if (salesRegister[countryCode]){
      var actualIncome = salesRegister[countryCode][0]["value"];
      salesRegister[countryCode][0]["value"] = +actualIncome + +saleValue;
    } else {
      var actualIncome = 0;
      salesRegister[countryCode] = messageJson;
    }
    
    console.log((new Date()) + ' ActualIncome: ' + actualIncome);


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
  var saleRank = salesRegister;
  io.emit('rankRoom', JSON.stringify(salesRegister));
}
