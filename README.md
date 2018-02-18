# Jellybean

**Ingredients needed**
 * [LND](https://github.com/lightningnetwork/lnd)
 * Raspberry Pi 
 * A candy dispenser with electric motor

## Hardware

Vending machine and Raspberry Pi instructions [here](https://medium.com/@eiaine/selling-real-world-goods-with-a-21-bitcoin-computer-c413ffe8376c#59a9). Basically you will need to wire up a simple common-emitter amplifier to give the Raspberry Pi GPIO pins enough power to drive a motor. Ignore the stuff about the 21 Computer and refer to the Raspberry Pi pinout diagram [here](https://pinout.xyz/).

<table>
  <tr><td>
<img src="https://raw.githubusercontent.com/elaineo/Jellybean/master/docs/ce-amplifier.jpg" width="300">
  </td><td>
<img src="https://raw.githubusercontent.com/elaineo/Jellybean/master/docs/ce-circuit.png" width="300">
  </tr>
</table>

## Software

### Server
The Lightning node and the payment page can both run on the Raspberry Pi. Or, a separate web server if you prefer. Instructions for installing the web app:
```
$ git clone https://github.com/elaineo/Jellybean
$ cd Jellybean/jellybean-server
$ npm install
```
Modify the web socket address in `views/index.html` ([line 278](https://github.com/elaineo/Jellybean/blob/eb1c719d8ad8b485dc4b5b0ef19116f4374ae64b/jellybean-server/views/index.html#L278)) to match your server address. Change the port numbers in `app.js` to reflect your own ports.

Run:
```
$ node app.js
```

### Client
The Raspberry Pi controllers are in this root directory. When you run `client.js`, it will create a socket connection to the web server (set this on [line 20](https://github.com/elaineo/Jellybean/blob/eb1c719d8ad8b485dc4b5b0ef19116f4374ae64b/app.js#L20)). Use `localhost` if the web server is hosted on the Pi.

Run:
```
$ node client.js
```
The client will create a socket connection to the web server, which will issue messages for the Pi to activate its GPIO pins and turn the vending machine.
