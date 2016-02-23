/*
    Server to monitor network and call client when appropriate
*/
require( './db' );

var WebSocketServer = require('ws').Server;
var url = require('url');
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var logger = require('morgan');
var util = require('util');
var http = require('http');
var https = require('https');
var querystring = require('querystring');
var favicon = require('serve-favicon');


var app = express();
var mongoose = require( 'mongoose' );
var Beans     = mongoose.model( 'Beans' );

app.set('port', process.env.PORT || 8080);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

var PING_TIME = 20000;

if ('test' == app.get('env')) {
  var ADDRESS = '2NB4uLhhyWFxAUEgc8ZC1PSiz66yBqznnj3';
  var ADDRESS_PATH = '/v1/btc/test3/payments?token=76a0fb3fe8f4a9a6df085958be202a9d';
}
else {
  var ADDRESS = '1ELainEb2moSBxWyTJGpQSS6EjRL6H7Cdi';
  var ADDRESS_PATH = '/v1/btc/main/payments?token=76a0fb3fe8f4a9a6df085958be202a9d';
}

var BCY = 'BwDf4eFgouWN22SxakwuPB5jLMSKBQZCvR';

var server = http.createServer(app);

server.listen(app.get('port'), function() { 
    console.log((new Date()) + " Server is listening on port " + app.get('port'));
});

// create the web socket server
var wsServer = new WebSocketServer({
    server: server
});

wsServer.on('connection', function connection(ws) {
  var location = url.parse(ws.upgradeReq.url, true);
  console.log((new Date()) + ' Connection from origin ' + util.inspect(location, false, null) + '.');

  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
  });
  // setTimeout(wsServer.keepAlive, PING_TIME);

  ws.send('Greetings, client!');
});


// serve a page
app.get('/', function(req, res){
  res.render('index.html');
});

app.get('/address', function(req, res){
  generateAddress(res); 
});

app.get('/beans', function(req, res){
  var msg = {
    "message": "received some beans",
    "sender": "Nick",
    "amount": 10000
  }
  wsServer.broadcast(JSON.stringify(msg));
  res.sendStatus(200);
});

app.post('/beans', function(req, res){
  console.log(req.body);

  var amount = req.body.value;
  var address = req.body.input_address;

  if (amount == "undefined") {
    console.log("invalid transaction;")
    res.sendStatus(400);
    return;
  }

  // parse body
  var msg = {
    "item": "beans",
    "message": "received some beans",
    "sender": "Nick",
    "amount": parseInt(amount)
  }
  wsServer.broadcast(JSON.stringify(msg));
  res.sendStatus(200);
});

app.post('/bcy', function(req, res){
  console.log(req.body);

  var outputs = req.body.outputs;

  for (var o=0; o<outputs.length; o++) {
    if (outputs[o].addresses.indexOf(BCY) > -1)
      var amount = outputs[0].value;    
  }
  if (amount == "undefined") {
    console.log("invalid transaction;")
    res.sendStatus(400);
    return;
  }
  Beans.findOne({'paid': false}, {}, { sort: { 'created_at' : -1 } }, function(err, bean) {
    var msg = {
        "message": "received some Abra beans",
        "sender": bean.first_name + bean.last_name,
        "amount": bean.bean_count,
        "item": "beans"
      }
      wsServer.broadcast(JSON.stringify(msg));
      msg.amount = bean.mm_count;
      msg.item = "mms"
      wsServer.broadcast(JSON.stringify(msg));
      bean.paid = true;
  });

  res.sendStatus(200);  
});


app.post('/abra', function(req, res){
  console.log(req.body);
  var beanQty = parseInt(req.body.beanQty) 
  var mmQty = parseInt(req.body.mmQty) 
  abraCustomer(req.body.phone, beanQty, mmQty, res);
});

wsServer.broadcast = function broadcast(data) {
  wsServer.clients.forEach(function each(client) {
    client.send(data);
  });
};

wsServer.keepAlive = function keepalive() {
  wsServer.clients.forEach(function each(client) {
    try { client.ping(); } catch (e) { console.log("failed ping"); }
  });
  setTimeout(wsServer.keepAlive, PING_TIME);
};

function generateAddress(response) {
  var post_options = {
        host: 'api.blockcypher.com',
        port: '80',
        path: ADDRESS_PATH,
        method: 'POST',
  };

  // Set up the request
  var post_req = http.request(post_options, function(res) {
      res.setEncoding('utf8');
      // get the input address
      res.on('data', function (data) {
          var d = JSON.parse(data)
          response.write(JSON.stringify({'address': d.input_address}));
          response.end();
      });
  });

  var query = {
      'destination' : ADDRESS,
      'callback_url': 'http://54.174.77.180/beans'
  }
  post_req.write(JSON.stringify(query));
  post_req.end();
}

function abraCustomer(phone, beanQty, mmQty, response) {

  var post_options = {
      host: 'merchant-bcy.abra.xyz',
      path: '/v1/customer?phone=' + encodeURIComponent(phone),
      method: 'GET',
      auth: 'VFL4HXB:12345'
  };

  // Set up the request
  var req = https.request(post_options, function(res) {
      res.setEncoding('utf8');
      res.on('data', function (d) {
          var data = JSON.parse(d);
          if ("error" in data) {
            console.log(data.error.message);
            response.write(JSON.stringify(data.error));
            response.end();
            return;
          } else {
            var customer = data.customer.id;
            var value = (beanQty*500) + (mmQty*1000);
            var beanData = new Beans({
                first_name     : data.customer.first_name,
                last_name      : data.customer.last_name,
                photo          : data.customer.photo,
                user_id        : data.customer.id,
                value          : value,
                mm_count       : mmQty,
                bean_count     : beanQty
              })
            beanData.save();
            console.log(beanData.id);

            var payment_options = {
              host: 'merchant-bcy.abra.xyz',
              path: '/v1/payment',
              method: 'POST',
              auth: 'VFL4HXB:12345',
              json: true,
              headers: {
                  "content-type": "application/json",
              }
            }
            var payment_data = {
              "customer_id": customer, 
              "amount": { "currency": "php", "value": value },
              "description": mmQty.toString() + " m&ms and " + beanQty.toString() + " jellybeans",
              "expiration": 60,
              "request_id": beanData._id
            }
            var payreq = https.request(payment_options, function(payres) {
              payres.setEncoding('utf8');
              payres.on('data', function (d) {
                var data = JSON.parse(d);
                console.log(data);
                if ("error" in data) {
                  response.write(JSON.stringify(data.error));
                  response.end();
                  return;
                } else {
                  response.write(JSON.stringify({'message': 'Payment request sent to your app'}));
                  response.end();
                }
              });
            });
            console.log(JSON.stringify(payment_data))
            payreq.write(JSON.stringify(payment_data));

            payreq.end();
          }

      });
  });
  req.end();

}