/*
    Server to monitor network and call client when appropriate
*/
var WebSocketServer = require('ws').Server;
var url = require('url');
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var logger = require('morgan');

var PING_TIME = 20000;

var app = express();

app.set('port', process.env.PORT || 8080);

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

var server = require('http').createServer(app);

server.listen(app.get('port'), function() { 
    console.log((new Date()) + " Server is listening on port " + app.get('port'));
});

// create the web socket server
var wsServer = new WebSocketServer({
    server: server
});

wsServer.on('connection', function connection(ws) {
  var location = url.parse(ws.upgradeReq.url, true);
  console.log((new Date()) + ' Connection from origin ' + JSON.parse(location) + '.');

  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
  });
  setTimeout(wsServer.keepAlive, PING_TIME);

  ws.send('Greetings, client!');
});


// serve a page
app.get('/', function(req, res){
  res.render('index.html');
});

app.get('/beans', function(req, res){
  var msg = {
    "message": "received some beans",
    "sender": "Nick",
    "amount": 10
  }
  wsServer.broadcast(JSON.stringify(msg));
  res.sendStatus(200);
});

app.post('/beans', function(req, res){
  var tx = JSON.parse(req.body);
  console.log(tx);
  // parse body
  var msg = {
    "message": "received some beans",
    "sender": "Nick",
    "amount": 10
  }
  wsServer.broadcast(msg);
  res.sendStatus(200);
});

wsServer.broadcast = function broadcast(data) {
  wsServer.clients.forEach(function each(client) {
    client.send(data);
  });
};

wsServer.keepAlive = function keepalive() {
  wsServer.clients.forEach(function each(client) {
    client.ping();
  });
  setTimeout(wsServer.keepAlive, PING_TIME);
};
