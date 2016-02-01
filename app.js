var express = require('express');
var path = require('path');
var gpio = require("pi-gpio");
var logger = require('morgan');
var bodyParser = require('body-parser');
var app = express();

app.set('port', process.env.PORT || 3000);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

gpio.open(1, "output", function(err) {     // Open pin 16 for output
    gpio.write(1, 1, function() {          // Set pin 16 high (1)
        console.log("bitcoin received");
        gpio.close(1);                     // Close pin 16
    });
});

// routes
app.get('/', function(req, res) {
  res.render('index');
});


var http = require('http').Server(app);
var io = require('socket.io')(http);

http.listen(app.get('port'), '0.0.0.0', function() {
    console.log('Express server listening on port ' + app.get('port'));
});

