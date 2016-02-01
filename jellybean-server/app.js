/*
    Server to monitor network and call client when appropriate
*/
var WebSocketServer = require('ws').Server;
var url = require('url');
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var logger = require('morgan');

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// serve a page
app.get('/', function(req, res){
  res.render('index.html', { title: 'Watson\'s Book Shop' });
});

var server = require('http').createServer(app);

server.listen(3000, function() { 
    console.log((new Date()) + " Server is listening on port 3000");
});

// create the server
var wsServer = new WebSocketServer({
    server: server
});

// WebSocket server
wsServer.on('connection', function connection(ws) {
  var location = url.parse(ws.upgradeReq.url, true);
  console.log((new Date()) + ' Connection from origin ' + location + '.');
  // you might use location.query.access_token to authenticate or share sessions
  // or ws.upgradeReq.headers.cookie (see http://stackoverflow.com/a/16395220/151312)

  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
  });

  ws.send('hi client');
});
