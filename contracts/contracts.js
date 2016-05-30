#!/usr/bin/env node

/* #################### beans.js #####################
      vending machine + vending machine purchaser
      TODO: separate into
             beanBuy.js  : vending machine purchaser client
             beanVend.js: vending machine code: should call
                 consume()/get() inside setInterval()
             beans.su

*/

var Promise = require('bluebird');
var fs = require('fs');
require('./web3E.js');

var Web3 = require('web3');
var web3 = new Web3();

var solc = require('solc');

// we shouldn't have to do this after web3E has done it, but can't
// get that working properly...
Promise.promisifyAll(web3.eth);

if (!web3.currentProvider) {
    web3.setProvider(new web3.providers.HttpProvider("http://localhost:8110"));
}
// XXX can currently only unlock on the server
accounts = web3.eth.accounts;
if (!web3.eth.defaultAccount) {
    web3.eth.defaultAccount = accounts[0];
}

// XXX convert to promise
var source = fs.readFileSync("beans.su", 'utf8');

var compiled = solc.compile(source,1);
    //####   console.log(compiled);
// var code = compiled.contracts.test.bytecode;
var code = compiled.contracts.beans.bytecode;
// var abi = JSON.parse(compiled.contracts.test.interface);
var abi = JSON.parse(compiled.contracts.beans.interface);

web3.eth.deployContract(code, abi).then(function(myContract) {

  Promise.promisifyAll(myContract);
  Promise.promisifyAll(myContract.payForBeans);
  Promise.promisifyAll(myContract.getMostRecentPaid);
  Promise.promisifyAll(myContract.consumeTurnMicroseconds);
  Promise.promisifyAll(myContract.getTurnMicroseconds);


//############## all the above was just setup ####################

  var res = myContract.getTurnMicroseconds.call();
  console.log('initial lastTurnMicroseconds: ' + res.toString(10));

  // 10^11 wei = 10^-7 ether
  var amountPaying = 10000000000;   //### in Wei = 10^-18 ether

  myContract.payForBeans.sendTransactionAsync({ value: amountPaying}).then(function(result) {
    web3.eth.awaitConsensus(result).then(function() {
      myContract.getMostRecentPaid.callAsync().then(function(res) {
         console.log('amount most recently paid: ' + res.toString(10));
      })

      myContract.consumeTurnMicroseconds.sendTransactionAsync().then(function(res) {
      //### I get some non-zero hex gibberish: meaningless
        console.log('immediate return value from consumeTurnMicroseconds: ' + res.toString(10));
        web3.eth.awaitConsensus(result).then(function() {
           myContract.getTurnMicroseconds.callAsync().then(function(res) {
              //### this s.b. correct
              console.log('most recent turnMicroseconds: ' + res.toString(10));
           })
         })   // awaitConsensus(().then()
      })  // consumeTurnMicroseconds.sendTransactionAsync().then()
    })  // awaitConsensus().then()
  })  // payForBeans.sendTransactionAsync().then()
});   // deployContract()