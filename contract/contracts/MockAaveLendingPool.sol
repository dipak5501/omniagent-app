// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title MockAaveLendingPool - Mock implementation of Aave LendingPool for Saga chain testing
contract MockAaveLendingPool {
    mapping(address => uint256) public userDeposits;
    mapping(address => uint256) public userBorrows;
    mapping(address => uint256) public reserveLiquidity;
    mapping(address => uint256) public reserveBorrowRate;
    mapping(address => uint256) public reserveLiquidityRate;
    
    event Deposit(address indexed asset, address indexed user, uint256 amount, uint16 indexed referral);
    event Withdraw(address indexed asset, address indexed user, address indexed to, uint256 amount);
    event Borrow(address indexed asset, address indexed user, uint256 amount, uint256 interestRateMode, uint16 indexed referral);
    event Repay(address indexed asset, address indexed user, address indexed repayer, uint256 amount);
    
    constructor() {}
    
    function deposit(
        address asset,
        uint256 amount,
        address onBehalfOf,
        uint16 referralCode
    ) external {
        require(amount > 0, "Amount must be greater than 0");
        require(asset != address(0), "Invalid asset address");
        
        // Mock deposit logic
        userDeposits[onBehalfOf] += amount;
        reserveLiquidity[asset] += amount;
        
        emit Deposit(asset, msg.sender, amount, referralCode);
    }
    
    function withdraw(
        address asset,
        uint256 amount,
        address to
    ) external returns (uint256) {
        require(amount > 0, "Amount must be greater than 0");
        require(userDeposits[msg.sender] >= amount, "Insufficient deposits");
        
        userDeposits[msg.sender] -= amount;
        reserveLiquidity[asset] -= amount;
        
        emit Withdraw(asset, msg.sender, to, amount);
        return amount;
    }
    
    function borrow(
        address asset,
        uint256 amount,
        uint256 interestRateMode,
        uint16 referralCode,
        address onBehalfOf
    ) external {
        require(amount > 0, "Amount must be greater than 0");
        require(reserveLiquidity[asset] >= amount, "Insufficient liquidity");
        
        userBorrows[onBehalfOf] += amount;
        reserveLiquidity[asset] -= amount;
        
        emit Borrow(asset, msg.sender, amount, interestRateMode, referralCode);
    }
    
    function repay(
        address asset,
        uint256 amount,
        uint256 /* interestRateMode */,
        address onBehalfOf
    ) external returns (uint256) {
        require(amount > 0, "Amount must be greater than 0");
        require(userBorrows[onBehalfOf] >= amount, "Insufficient borrows");
        
        userBorrows[onBehalfOf] -= amount;
        reserveLiquidity[asset] += amount;
        
        emit Repay(asset, onBehalfOf, msg.sender, amount);
        return amount;
    }
    
    function getReserveData(address asset) external view returns (
        uint256 configuration,
        uint128 liquidityIndex,
        uint128 variableBorrowIndex,
        uint128 currentLiquidityRate,
        uint128 currentVariableBorrowRate,
        uint128 currentStableBorrowRate,
        uint40 lastUpdateTimestamp,
        uint16 id,
        address aTokenAddress,
        address stableDebtTokenAddress,
        address variableDebtTokenAddress,
        address interestRateStrategyAddress,
        uint8 decimals
    ) {
        return (
            0, // configuration
            1e27, // liquidityIndex
            1e27, // variableBorrowIndex
            uint128(reserveLiquidityRate[asset]), // currentLiquidityRate
            uint128(reserveBorrowRate[asset]), // currentVariableBorrowRate
            0, // currentStableBorrowRate
            uint40(block.timestamp), // lastUpdateTimestamp
            0, // id
            address(0), // aTokenAddress
            address(0), // stableDebtTokenAddress
            address(0), // variableDebtTokenAddress
            address(0), // interestRateStrategyAddress
            18 // decimals
        );
    }
    
    // Admin functions to set rates for testing
    function setReserveBorrowRate(address asset, uint256 rate) external {
        reserveBorrowRate[asset] = rate;
    }
    
    function setReserveLiquidityRate(address asset, uint256 rate) external {
        reserveLiquidityRate[asset] = rate;
    }
    
    // Allow the contract to receive ETH
    receive() external payable {}
}
