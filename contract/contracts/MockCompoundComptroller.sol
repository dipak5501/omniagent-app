// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title MockCompoundComptroller - Mock implementation of Compound Comptroller for Saga chain testing
contract MockCompoundComptroller {
    mapping(address => bool) public markets;
    mapping(address => uint256) public borrowCaps;
    mapping(address => uint256) public supplyCaps;
    mapping(address => uint256) public borrowRates;
    mapping(address => uint256) public supplyRates;
    
    event MarketEntered(address cToken, address account);
    event MarketExited(address cToken, address account);
    event BorrowCapSet(address cToken, uint256 newCap);
    event SupplyCapSet(address cToken, uint256 newCap);
    
    constructor() {}
    
    function enterMarkets(address[] calldata cTokens) external returns (uint256[] memory) {
        uint256[] memory results = new uint256[](cTokens.length);
        
        for (uint256 i = 0; i < cTokens.length; i++) {
            markets[cTokens[i]] = true;
            results[i] = 0; // 0 = success
            emit MarketEntered(cTokens[i], msg.sender);
        }
        
        return results;
    }
    
    function exitMarket(address cToken) external returns (uint256) {
        require(markets[cToken], "Market not entered");
        
        // Mock exit logic - in real Compound this would check for borrows
        markets[cToken] = false;
        emit MarketExited(cToken, msg.sender);
        
        return 0; // 0 = success
    }
    
    function getAccountLiquidity(address /* account */) external pure returns (uint256, uint256, uint256) {
        // Mock liquidity calculation
        return (1000e18, 500e18, 500e18); // total, borrowable, excess
    }
    
    function getAssetsIn(address /* account */) external pure returns (address[] memory) {
        // Mock implementation - return empty array for simplicity
        return new address[](0);
    }
    
    function checkMembership(address /* account */, address cToken) external view returns (bool) {
        return markets[cToken];
    }
    
    function getBorrowCap(address cToken) external view returns (uint256) {
        return borrowCaps[cToken];
    }
    
    function getSupplyCap(address cToken) external view returns (uint256) {
        return supplyCaps[cToken];
    }
    
    function getBorrowRate(address cToken) external view returns (uint256) {
        return borrowRates[cToken];
    }
    
    function getSupplyRate(address cToken) external view returns (uint256) {
        return supplyRates[cToken];
    }
    
    // Admin functions to set caps and rates for testing
    function setBorrowCap(address cToken, uint256 newCap) external {
        borrowCaps[cToken] = newCap;
        emit BorrowCapSet(cToken, newCap);
    }
    
    function setSupplyCap(address cToken, uint256 newCap) external {
        supplyCaps[cToken] = newCap;
        emit SupplyCapSet(cToken, newCap);
    }
    
    function setBorrowRate(address cToken, uint256 rate) external {
        borrowRates[cToken] = rate;
    }
    
    function setSupplyRate(address cToken, uint256 rate) external {
        supplyRates[cToken] = rate;
    }
    
    function addMarket(address cToken) external {
        markets[cToken] = true;
    }
    
    function removeMarket(address cToken) external {
        markets[cToken] = false;
    }
    
    // Allow the contract to receive ETH
    receive() external payable {}
}
