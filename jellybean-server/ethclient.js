var Web3 = require('web3');

var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('http://54.174.77.180:8545'));


if(!web3.isConnected()) console.log("bad connection");
else console.log("successful connection");

var coinbase = web3.eth.coinbase;
var balance = web3.eth.getBalance(coinbase);
console.log(balance.toString(10));

var abi = [{
        constant: false,
        inputs: [],
        name: "consumeTurnMicroseconds",
        outputs: [{
            name: "d",
            type: "uint256"
        }],
        type: "function"
    }, {
        constant: true,
        inputs: [],
        name: "lastTurnMicroseconds",
        outputs: [{
            name: "",
            type: "uint256"
        }],
        type: "function"
    }, {
        constant: true,
        inputs: [],
        name: "mostRecentPaid",
        outputs: [{
            name: "",
            type: "uint256"
        }],
        type: "function"
    }, {
        constant: false,
        inputs: [],
        name: "getTurnMicroseconds",
        outputs: [{
            name: "d",
            type: "uint256"
        }],
        type: "function"
    }, {
        constant: false,
        inputs: [],
        name: "payForBeans",
        outputs: [{
            name: "d",
            type: "uint256"
        }],
        type: "function"
    }, {
        constant: true,
        inputs: [],
        name: "turnMicroseconds",
        outputs: [{
            name: "",
            type: "uint256"
        }],
        type: "function"
    }, {
        constant: false,
        inputs: [],
        name: "getMostRecentPaid",
        outputs: [{
            name: "d",
            type: "uint256"
        }],
        type: "function"
    }, {
        inputs: [],
        type: "constructor"
    }];

var beansAddress = "0x06fccdfc1b767b9ac654b366c4a915628dda98a5"
var beans = web3.eth.contract(abi).at(beansAddress);

var price = beansContract.mostRecentPaid();
console.log(price)