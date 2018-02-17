var Gpio = require('onoff').Gpio; 
var LED = new Gpio(26, 'out'); 
var Beans = new Gpio(16, 'out'); 
var blinkInterval = setInterval(blinkLED, 250); //run the blinkLED function every 250ms

function blinkLED() { //function to start blinking
  if (LED.readSync() === 0) { //check the pin state, if the state is 0 (or off)
    LED.writeSync(1); //set pin state to 1 (turn LED on)
  } else {
    LED.writeSync(0); //set pin state to 0 (turn LED off)
  }
}
Beans.writeSync(1);

function endBlink() { //function to stop blinking
  clearInterval(blinkInterval); // Stop blink intervals
  LED.writeSync(0); // Turn LED off
  LED.unexport(); // Unexport GPIO to free resources
  Beans.writeSync(0);
  Beans.unexport();
}

setTimeout(endBlink, 1000); //stop blinking after 1 seconds