// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title GreenSupplyToken
 * @dev ERC20 token for green supply chain tracking
 * This token represents carbon credits or supply chain credits
 */
contract GreenSupplyToken is ERC20, ERC20Burnable, Ownable {
    uint8 private constant _decimals = 18;
    
    event TokensMinted(address indexed to, uint256 amount);
    event TokensBurned(address indexed from, uint256 amount);

    constructor(
        string memory name,
        string memory symbol,
        address initialOwner
    ) ERC20(name, symbol) Ownable(initialOwner) {
        // Initial supply can be minted by owner
    }

    /**
     * @dev Mint tokens to a specific address
     * @param to Address to receive tokens
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }

    /**
     * @dev Burn tokens from caller's account
     * @param amount Amount of tokens to burn
     */
    function burn(uint256 amount) public override {
        super.burn(amount);
        emit TokensBurned(msg.sender, amount);
    }

    /**
     * @dev Returns the number of decimals used
     */
    function decimals() public pure override returns (uint8) {
        return _decimals;
    }
}

