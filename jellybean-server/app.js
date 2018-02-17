/*
    Server to monitor network and call client when appropriate
*/
var WebSocketServer = require('ws').Server;
var url = require('url');
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var logger = require('morgan');
var util = require('util');
var http = require('http');
var https = require('https');
var querystring = require('querystring');
var favicon = require('serve-favicon');


var app = express();

app.set('port', process.env.PORT || 8080);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

var grpc = require('grpc');
var fs = require("fs");
var protobuf = require("protobufjs");


//  Lnd cert is at ~/.lnd/tls.cert on Linux and
//  ~/Library/Application Support/Lnd/tls.cert on Mac
var lndCert = fs.readFileSync("/Users/elaineo/Library/Application Support/Lnd/tls.cert");
var credentials = grpc.credentials.createSsl(lndCert);
var lnrpcDescriptor = grpc.load("rpc.proto");
var lnrpc = lnrpcDescriptor.lnrpc;
var lightning = new lnrpc.Lightning('localhost:10009', credentials);
var lnclient = lightning.subscribeInvoices({});

lnclient.on('data', function(message) {
    console.log(message);
    if (message.settled) wsServer.confirm(message);
});
lnclient.on('end', function() {
    console.log("END");
});
lnclient.on('status', function(status) {
    console.log("Current status: " + status);
});

var server = http.createServer(app);

server.listen(app.get('port'), function() { 
    console.log((new Date()) + " Server is listening on port " + app.get('port'));
});


// create the web socket server to vending machine
var wsServer = new WebSocketServer({
    server: server
});

wsServer.on('connection', function connection(ws) {
  var location = url.parse(ws.upgradeReq.url, true);
  if (location.query) ws.r_hash = location.query.r_hash;
  console.log((new Date()) + ' Connection from origin ' + util.inspect(location, false, null) + '.');

  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
  });

  ws.send('{"msg": "Greetings, client!"}');
});

var PING_TIME = 20000;

var BEAN_PRICE = 50000;

app.get('/', function(req, res){
  res.render('index.html');
});

app.get('/clients', function(req, res){
  var clients = wsServer.clients.map(c => c.r_hash);
  res.write(JSON.stringify(clients));
  res.end()
})

app.get('/test', function(req, res){
  wsServer.broadcast(JSON.stringify({"settle_date":"1518829726","memo":"4 Beans","value":"5"}));
  res.sendStatus(200);
})

app.post('/invoice', function(req, res){
  console.log(req.body);
  var memo = req.body.qty.toString() + ' Beans';
  generateInvoice(memo, req.body.price, res); 
});

app.get('/beans', function(req, res){
  var msg = {
    "item": "beans",
    "sender": "test",
    "amount": 1
  }
  wsServer.broadcast(JSON.stringify(msg));
  res.sendStatus(200);
});

wsServer.broadcast = function broadcast(data) {
  wsServer.clients.forEach(function each(client) {
    client.send(data);
  });
};

wsServer.keepAlive = function keepalive() {
  wsServer.clients.forEach(function each(client) {
    try { client.ping(); } catch (e) { console.log("failed ping"); }
  });
  setTimeout(wsServer.keepAlive, PING_TIME);
};

wsServer.confirm = function confirm(message) {
  wsServer.clients.forEach(function each(client) {
    var r_hash = protobuf.ByteBuffer.btoa(message.r_hash);
    console.log(r_hash)
    var response = {'settle_date': message.settle_date, memo: message.memo, value: message.value};
    if (client.r_hash === r_hash) client.send(JSON.stringify(response));
  });
};


function generateInvoice(memo, value, response) {
    lightning.addInvoice({ 
      memo: memo,
      value: value,
    }, function(err, data) {
      console.log(data);
      response.write(JSON.stringify({
        'invoice': data.payment_request, 
        'r_hash': protobuf.ByteBuffer.btoa(data.r_hash)
      }));
      response.end();
    })
}
