// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title MockUSDC - Mock implementation of USDC for Saga chain testing
contract MockUSDC is ERC20 {
    uint8 private _decimals = 6; // USDC has 6 decimals
    
    constructor() ERC20("Mock USDC", "mUSDC") {
        // Mint some initial supply to the deployer
        _mint(msg.sender, 1000000 * 10**6); // 1M USDC
    }
    
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
    
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
    
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
    
    // Function to get some USDC for testing (anyone can call)
    function faucet() external {
        _mint(msg.sender, 1000 * 10**6); // 1000 USDC
    }
}
