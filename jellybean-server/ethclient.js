var Web3 = require('web3');

var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('http://54.174.77.180:8545'));
console.log(web3)
//var coinbase = web3.eth.coinbase;
//var balance = web3.eth.getBalance(coinbase);
if(!web3.isConnected()) console.log("bad connection");
else console.log("successful connection");