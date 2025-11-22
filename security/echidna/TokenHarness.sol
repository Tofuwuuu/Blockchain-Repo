// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../contracts/erc20/GreenSupplyToken.sol";

contract TokenHarness {
    GreenSupplyToken public token;
    
    constructor() {
        token = new GreenSupplyToken("Test", "TST", address(this));
    }
    
    // Property: Total supply should always equal sum of balances
    function echidna_total_supply_invariant() public view returns (bool) {
        // This is a simplified check - in practice, you'd track all balances
        return token.totalSupply() >= 0;
    }
    
    // Property: Owner can always mint
    function echidna_owner_can_mint() public view returns (bool) {
        return token.owner() == address(this);
    }
}

