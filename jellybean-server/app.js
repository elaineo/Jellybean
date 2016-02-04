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
var Web3 = require('web3');

var app = express();

app.set('port', process.env.PORT || 8080);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

var PING_TIME = 20000;

if ('test' == app.get('env')) {
  var ADDRESS = '2NB4uLhhyWFxAUEgc8ZC1PSiz66yBqznnj3';
  var ADDRESS_PATH = '/v1/btc/test3/payments?token=76a0fb3fe8f4a9a6df085958be202a9d';
}
else {
  var ADDRESS = '1ELainEb2moSBxWyTJGpQSS6EjRL6H7Cdi';
  var ADDRESS_PATH = '/v1/btc/main/payments?token=76a0fb3fe8f4a9a6df085958be202a9d';
}

var server = http.createServer(app);

var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('http://54.174.77.180:8545'));
console.log(web3)
//var coinbase = web3.eth.coinbase;
//var balance = web3.eth.getBalance(coinbase);
if(!web3.isConnected()) console.log("bad connection");
else console.log("successful connection");

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

app.get('/address', function(req, res){
  generateAddress(res); 
});

app.get('/beans', function(req, res){
  var msg = {
    "message": "received some beans",
    "sender": "Nick",
    "amount": 10000
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
    "message": "received some beans",
    "sender": "Nick",
    "amount": parseInt(amount)
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

function generateAddress(response) {
  var post_options = {
        host: 'api.blockcypher.com',
        port: '80',
        path: ADDRESS_PATH,
        method: 'POST',
  };

  // Set up the request
  var post_req = http.request(post_options, function(res) {
      res.setEncoding('utf8');
      // get the input address
      res.on('data', function (data) {
          var d = JSON.parse(data)
          response.write(JSON.stringify({'address': d.input_address}));
          response.end();
      });
  });

  var query = {
      'destination' : ADDRESS,
      'callback_url': 'http://54.174.77.180/beans'
  }
  post_req.write(JSON.stringify(query));
  post_req.end();
}
