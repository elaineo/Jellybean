/*
    GPIO test */ var gpio = require("pi-gpio");

var p = 18;
gpio.close(p);
  gpio.open(p, "output", function(err) {
    gpio.write(p, 1, function() {
      console.log("writing to " + p);
      setTimeout(function() { cleanup(p) }, 10000);
    });
  });

function cleanup(q) {
  gpio.close(q);
}
