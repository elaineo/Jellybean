/*
    GPIO test
*/
var gpio = require("pi-gpio");

function startMotor (p, time) {
  gpio.open(p, "output", function(err) {   
    gpio.write(p, 1, function() {          
      console.log("writing to " + p);
      setTimeout(gpio.close(p), time);
    });
  });  
}

startMotor(16, 5000);