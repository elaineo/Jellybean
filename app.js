var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var app = express();

var WebSocket = require('ws');

var PING_TIME = 20000;

// pi only
if ('test' == app.get('env')) {
  var gpio = null;
  var wsurl = 'ws://127.0.0.1:8080'
}
else {
  var gpio = require("pi-gpio");
  var wsurl = 'ws://54.174.77.180';
}

var connection = new WebSocket(wsurl);

app.set('port', process.env.PORT || 4000);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

connection.on('open', function open() {
  connection.send('something');
});

connection.on('close', function open() {
  console.log('closed, reconnecting');
  setTimeout (keepAlive, PING_TIME);
});

connection.on('ping', function () {
  console.log('ping');
});

connection.on('error', function (error) {
  console.log(error);
  setTimeout (keepAlive, PING_TIME);
});

connection.on('message', function(data, flags) {
  console.log(data);
  
  // not on the pi
  if ('test' == app.get('env')) return;

  gpio.open(16, "output", function(err) {     // Open pin 16 for output
    gpio.write(16, 1, function() {          // Set pin 16 high (1)
        console.log("received something");
        setTimeout(stopMotor,5000);
      });
    });
});


// debug 
function stopMotor () {
    gpio.close(16);                     // Close pin 16
}

// routes
app.get('/', function(req, res) {
  res.render('index');
});


var http = require('http').Server(app);

http.listen(app.get('port'), '0.0.0.0', function() {
    console.log('Express server listening on port ' + app.get('port'));
});

 
function keepAlive(){
  connection = new WebSocket(wsurl);
  var localConn = connection;

  var timeout = setTimeout(function() {
                  console.log('ReconnectingWebSocket timed out');
                  localConn.close();
                  keepAlive();
                }, PING_TIME*10);

  connection.on('open', function() {
    clearTimeout(timeout);
    console.log('Reconnected')
  });
}
