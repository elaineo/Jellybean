var express = require('express');
var path = require('path');
var gpio = require("rpi-gpio");
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

gpio.setup(16, gpio.DIR_OUT, write);
 
function write() {
    gpio.write(16, true, function(err) {
        if (err) throw err;
        console.log('Written to pin');
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

