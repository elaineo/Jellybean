contract beans {
//  ### seller/buyer/shipper (bill of lading) model under construction

uint256 public mostRecentPaid;
uint256 public turnMicroseconds;
uint256 public lastTurnMicroseconds;

uint256 public junk;
uint256 public rubbish;

struct bid {
      uint256 price;
      uint256 amount;
}
struct ask {
      uint256 price;
      uint256 amount;
}

mapping (address => bid) bids;
mapping (address => ask) asks;

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

// ###################### begin buyer/seller/shipper stuff ##############

    function buyerRevokeBid() {
        bids[msg.sender].price = 0;
        bids[msg.sender].amount = 0;
        //#### send ether from escrow to buyer
    }

    function buyerBid(uint numTurns, address counterparty) {
        buyerRevokeBid();
        bids[msg.sender].price = msg.value;
        bids[msg.sender].amount = numTurns;
        //### send ether from contract to escrow-bot
        //### or maybe contract is the escrow-bot, and it's credited
        //### by looking at bid[party].amount
        //### works: if (count > 0 && RPs[a].pendingCfpOpen > 0) {
        if (msg.value >= asks[counterparty].price && numTurns <= asks[counterparty].amount) {
           //### seal the deal: send details to shipper cc: buyer & seller
           junk = rubbish;
        }
    }

    function sellerRevokeAsk() {
        asks[msg.sender].price = 0;
        asks[msg.sender].amount = 0;
        //### return numTurns beans from escrow-bot to seller
    }

    function sellerAsk(uint price, uint numTurns, address counterparty) {
        sellerRevokeAsk();
        asks[msg.sender].price = price;
        asks[msg.sender].amount = numTurns;
        //### change title of numTurns beans to DvP escrow-bot
        if (msg.value >= asks[counterparty].price && numTurns <= asks[counterparty].amount) {
           //### seal the deal: send details to shipper cc: buyer & seller
           junk = rubbish;
       }
    }



   /* #####
   constraints to be enforced:
     * seller owns turns she sells
     * seller has a pickup location (encrypted to shipper: blockchain just sees 4 random uint 256s, i.e. 1024 bits)
     * buyer has a dropoff location ("")
     * seller pays a pickup fee & buyer a dropoff fee
     * how to prove pickup & dropoff to the escrow bot?
   */


 // ###################### end buyer/seller/shipper stuff ##############

}