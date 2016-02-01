/*
    Server to monitor network and call client when appropriate
*/
"use strict";


var WebSocketServer = require('websocket').server;
var http = require('http');

var server = http.createServer(function(request, response) {
    // process HTTP request. Since we're writing just WebSockets server
    // we don't have to implement anything.
});
server.listen(3000, function() { 
    console.log((new Date()) + " Server is listening on port 3000");
});

// create the server
var wsServer = new WebSocketServer({
    httpServer: server
});

// WebSocket server
var clients = [];
wsServer.on('request', function(request) {
    console.log((new Date()) + ' Connection from origin ' + request.origin + '.');

    // accept everyone right now
    var connection = request.accept(null, request.origin);
    var index = clients.push(connection) - 1;

    // Probably won't receive any messages
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log(message.utf8Data);
        }
    });

    connection.on('close', function(connection) {
        if (userName !== false && userColor !== false) {
            console.log((new Date()) + " Peer "
                + connection.remoteAddress + " disconnected.");
            // remove user from the list of connected clients
            clients.splice(index, 1);
            // push back user's color to be reused by another user
            colors.push(userColor);
        }
    });
});

// push message to clients
var obj = {
    time: (new Date()).getTime(),
    text: "hello"
};
var json = JSON.stringify({ type:'message', data: obj });
for (var i=0; i < clients.length; i++) {
    clients[i].sendUTF(json);
}