/*
    Vending machine physical controller */ var express = 
require('express'); var path = require('path'); var logger = 
require('morgan'); var bodyParser = require('body-parser'); var app = 
express();

var WebSocket = require('ws');

var PING_TIME = 20000; var DELAY_TIME = 1.5; var MAX_RETRIES = 10;

// pi only 
if ('test' == app.get('env')) {
  var gpio = null;
  var wsurl = 'ws://127.0.0.1:8080'
}
else {
  var gpio = require("pi-gpio");
  var wsurl = 'ws://54.174.77.180';
}

var connection; openSocket(0);

app.set('port', process.env.PORT || 4000);

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Dispense goods
function dispense (qty) {
  startMotor (16, qty);
  // LED pin
  startMotor (18, qty);
}

function cleanup() {
  gpio.close(16);
  gpio.close(18);
}

//cleanup();

function startMotor (p, time) {
  gpio.open(p, "output", function(err) {   
    gpio.write(p, 1, function() {          
      console.log("writing to " + p);
      setTimeout(function() { stopMotor(p); }, time);
    });
  });  
}
function stopMotor(p) {
  gpio.close(p);
}

var http = require('http').Server(app);

http.listen(app.get('port'), '0.0.0.0', function() {
    console.log('Express server listening on port ' + app.get('port'));
});

function openSocket(reconnectAttempts){
  if (reconnectAttempts > MAX_RETRIES) {
    console.log('Max retries reached');
    return
  }
  connection = new WebSocket(wsurl);

  var localConn = connection;

  var timeout = setTimeout(function() {
                  console.log('ReconnectingWebSocket timed out');
                  localConn.close();
                  openSocket(reconnectAttempts++);
                }, PING_TIME*10);

  connection.on('open', function() {
    clearTimeout(timeout);
    console.log('Connected');
    connection.send('Hello from client');
    //dispense(Math.floor(3000));
  });

  connection.on('message', function(data, flags) {
    console.log(data);

    // TODO! Amount will be in satoshis
    // normalize somehow
    var amount = parseInt(data.amount);
    
    // not on the pi
    if ('test' == app.get('env')) return;

    dispense(amount);
  });

  connection.on('ping', function () {
  });

  connection.on('error', function (error) {
    clearTimeout(timeout);
    var longTime = PING_TIME * Math.pow(DELAY_TIME, reconnectAttempts);
    setTimeout (openSocket(reconnectAttempts++), longTime);
  });

  connection.on('close', function () {
    console.log('closed, reconnecting');
    setTimeout (openSocket(0), PING_TIME);
  });
}
