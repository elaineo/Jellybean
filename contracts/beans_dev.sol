contract beansDev {
    uint256 public mostRecentPaid;
    uint256 public turnMicroseconds;
    uint256 public lastTurnMicroseconds;
    address public owner;

    // collect purchases, store in whatever.
    // when payment is made, dispense
    struct Order
    {
        uint256 request;
        uint256 payment;
        bool paid;
        string message;
        string name;
    }

    function beans() {
        owner = msg.sender;
        mostRecentPaid = 0;
        turnMicroseconds = 0;
        lastTurnMicroseconds = 0;
    }


    function payForBeans(uint payment) returns (uint d) {
        mostRecentPaid = payment;
        turnMicroseconds += mostRecentPaid / 1000;
    }

    function getMostRecentPaid() returns (uint d) {
        return mostRecentPaid;
    }

    function consumeTurnMicroseconds() returns (uint d) {
        //### todo: only vending machine s.b. able to call this
        lastTurnMicroseconds = turnMicroseconds;
        turnMicroseconds = 0;
        return lastTurnMicroseconds;
    }

    function getTurnMicroseconds() returns (uint d) {
        //### todo: only vending machine s.b. able to call this
        return lastTurnMicroseconds;
    }

    function kill() 
    { 
        if (msg.sender == owner)
            suicide(owner);  // kills this contract and sends remaining funds back to creator
    }

}