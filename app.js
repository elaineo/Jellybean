var express = require('express');
var path = require('path');
//var gpio = require("pi-gpio");
var logger = require('morgan');
var bodyParser = require('body-parser');
var app = express();

var WebSocket = require('ws');


app.set('port', process.env.PORT || 4000);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

var connection = new WebSocket('ws://127.0.0.1:3000');
connection.on('open', function open() {
  connection.send('something');
});

connection.on('error', function (error) {
  console.log(error);
});

connection.on('message', function(data, flags) {
  console.log(data);
});

/*
gpio.open(16, "output", function(err) {     // Open pin 16 for output
    gpio.write(16, 1, function() {          // Set pin 16 high (1)
        console.log("received something");
        setTimeout(stopMotor,5000);
    });
});

// debug 
function stopMotor () {
    gpio.close(16);                     // Close pin 16
}
*/
// routes
app.get('/', function(req, res) {
  res.render('index');
});


var http = require('http').Server(app);

http.listen(app.get('port'), '0.0.0.0', function() {
    console.log('Express server listening on port ' + app.get('port'));
});

