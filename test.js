/*
    GPIO test */ 

var gpio = require("pi-gpio");

function startUp(p) {
  gpio.open(p, "output", function(err) {
    gpio.write(p, 1, function() {
      console.log("writing to " + p);
      setTimeout(function() { cleanup(p) }, 10000);
    });
  });
}
function cleanup(q) {
  gpio.close(q);
}

startUp(16);;
startUp(18);
