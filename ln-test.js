var WebSocket = require('ws');
var t_ = require('./jTime.js');

var PING_TIME = 20000; 
var DELAY_TIME = 1.5; 
var MAX_RETRIES = 10;


var wsurl = 'wss://beans4bits.com';

var connection; 
openSocket(0);

function isConnected() {
  connection.send('ping!');
  if (connection.readyState != 1) {
    console.log('Disconnected. Reconnecting...');
    openSocket(0);
  }
}

t_.setInterval(600000, isConnected)

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
  });

  connection.on('message', function(data, flags) {
    console.log(data);
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
