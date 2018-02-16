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

//  Lnd cert is at ~/.lnd/tls.cert on Linux and
//  ~/Library/Application Support/Lnd/tls.cert on Mac
var lndCert = fs.readFileSync("/Users/elaineo/Library/Application Support/Lnd/tls.cert");
var credentials = grpc.credentials.createSsl(lndCert);
var lnrpcDescriptor = grpc.load("rpc.proto");
var lnrpc = lnrpcDescriptor.lnrpc;
var lightning = new lnrpc.Lightning('localhost:10009', credentials);

var PING_TIME = 20000;

var BEAN_PRICE = 50000;

var server = http.createServer(app);

server.listen(app.get('port'), function() { 
    console.log((new Date()) + " Server is listening on port " + app.get('port'));
});

// create the web socket server
var wsServer = new WebSocketServer({
    server: server
});

wsServer.on('connection', function connection(ws) {
  var location = url.parse(ws.upgradeReq.url, true);
  console.log((new Date()) + ' Connection from origin ' + util.inspect(location, false, null) + '.');

  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
  });
  // setTimeout(wsServer.keepAlive, PING_TIME);

  ws.send('Greetings, client!');
});


// serve a page
app.get('/', function(req, res){
  res.render('index.html');
});

app.post('/invoice', function(req, res){
  console.log(req.body);
  var memo = 'Beans: ' + req.body.qty.toString();
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

app.post('/beans', function(req, res){
  console.log(req.body);

  var amount = req.body.value;
  var address = req.body.input_address;

  if (amount == "undefined") {
    console.log("invalid transaction;")
    res.sendStatus(400);
    return;
  }

  // parse body
  var msg = {
    "item": "beans",
    "message": "received some beans",
    "sender": "Nick",
    "amount": Math.floor(parseInt(amount)/50000)
  }
  wsServer.broadcast(JSON.stringify(msg));
  res.sendStatus(200);
});

app.post('/bcy', function(req, res){
  console.log(req.body);

  var outputs = req.body.outputs;

  for (var o=0; o<outputs.length; o++) {
    if (outputs[o].addresses.indexOf(BCY) > -1)
      var amount = outputs[0].value;    
  }
  if (amount == "undefined") {
    console.log("invalid transaction;")
    res.sendStatus(400);
    return;
  }
  Beans.findOne({'paid': false}, {}, { sort: { 'created_at' : -1 } }, function(err, bean) {
    if (!bean) {
      var msg = {
        "message": "received some Abra money",
        "sender": "no record found",
        "amount": 1,
        "item": "mms"
      }  
    } else {
      var msg = {
        "message": "received some Abra beans",
        "sender": bean.first_name + bean.last_name,
        "amount": bean.bean_count,
        "item": "beans"
      }
      wsServer.broadcast(JSON.stringify(msg));
      msg.amount = bean.mm_count;
      msg.item = "mms";
      bean.paid = true;
      bean.save();
    }
      wsServer.broadcast(JSON.stringify(msg));
  });

  //TODO: handle cases where we can't find an attached tx

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

function generateInvoice(memo, value, response) {
    lightning.addInvoice({ 
      memo: memo,
      value: value,
    }, function(err, data) {
      console.log(data)
      response.write(JSON.stringify({'invoice': data.payment_request}));
      response.end();
    })
}
