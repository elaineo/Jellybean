/*
    Server to monitor network and call client when appropriate
*/
"use strict";


var WebSocketServer = require('ws').Server;
var http = require('http');
var url = require('url');

var server = http.createServer(function(request, response) {
    // process HTTP request. Since we're writing just WebSockets server
    // we don't have to implement anything.
});
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
