var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var app = express();

var WebSocket = require('ws');

var PING_TIME = 20000;
var DELAY_TIME = 1.5;
var MAX_RETRIES = 10;

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

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

connection.on('open', function () {
  connection.send('Hello from client');
});

connection.on('close', function () {
  console.log('closed, reconnecting');
  setTimeout (keepAlive(0), PING_TIME);
});

connection.on('ping', function () {
  console.log('ping');
});

connection.on('error', function (error) {
  console.log(error);
  setTimeout (keepAlive(0), PING_TIME);
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

var http = require('http').Server(app);

http.listen(app.get('port'), '0.0.0.0', function() {
    console.log('Express server listening on port ' + app.get('port'));
});

function keepAlive(reconnectAttempts){
  if (reconnectAttempts > MAX_RETRIES) {
    console.log('Max retries reached');
    return
  }
  connection = new WebSocket(wsurl);

  var localConn = connection;

  var timeout = setTimeout(function() {
                  console.log('ReconnectingWebSocket timed out');
                  localConn.close();
                  keepAlive(reconnectAttempts++);
                }, PING_TIME*10);

  connection.on('open', function() {
    clearTimeout(timeout);
    console.log('Reconnected')
  });
  connection.on('error', function (error) {
    clearTimeout(timeout);
    var longTime = PING_TIME * Math.pow(DELAY_TIME, reconnectAttempts);
    setTimeout (keepAlive(reconnectAttempts++), longTime);
  });

}
