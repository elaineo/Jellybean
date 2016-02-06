contract beans {
//## directions we could take this
//## (1) warehouse receipts model --> futures, derivatives, ...
//## (2) seller/buyer/delivery (bill of lading) model

    uint256 public mostRecentPaid;
    uint256 public turnMicroseconds;
    uint256 public lastTurnMicroseconds;

    function beans() {
        mostRecentPaid = 0;
        turnMicroseconds = 0;
        lastTurnMicroseconds = 0;
    }


    function payForBeans() returns (uint d) {
        mostRecentPaid = msg.value;
        //### todo: base this price on agreement between
        //### a buyer and a seller
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

}