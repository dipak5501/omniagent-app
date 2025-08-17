// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title MockUniswapV3Router - Mock implementation of Uniswap V3 Router for Saga chain testing
contract MockUniswapV3Router {
    mapping(address => mapping(address => uint256)) public mockRates; // tokenIn => tokenOut => rate
    mapping(address => uint256) public mockLiquidity;
    
    event Swap(
        address indexed tokenIn,
        address indexed tokenOut,
        address indexed recipient,
        uint256 amountIn,
        uint256 amountOut
    );
    
    constructor() {
        // Set some default mock rates
        mockRates[address(0)][0x0000000000000000000000000000000000000001] = 1e18; // ETH to USDC (mock)
        mockRates[0x0000000000000000000000000000000000000001][address(0)] = 1e18; // USDC to ETH (mock)
    }
    
    struct ExactInputSingleParams {
        address tokenIn;
        address tokenOut;
        uint24 fee;
        address recipient;
        uint256 deadline;
        uint256 amountIn;
        uint256 amountOutMinimum;
        uint160 sqrtPriceLimitX96;
    }
    
    struct ExactInputParams {
        bytes path;
        address recipient;
        uint256 deadline;
        uint256 amountIn;
        uint256 amountOutMinimum;
    }
    
    function exactInputSingle(ExactInputSingleParams calldata params) external payable returns (uint256 amountOut) {
        require(block.timestamp <= params.deadline, "Transaction too old");
        require(params.amountIn > 0, "Amount must be greater than 0");
        
        // Mock swap calculation
        uint256 rate = mockRates[params.tokenIn][params.tokenOut];
        if (rate == 0) {
            rate = 1e18; // Default 1:1 rate if not set
        }
        
        amountOut = (params.amountIn * rate) / 1e18;
        require(amountOut >= params.amountOutMinimum, "Insufficient output amount");
        
        emit Swap(params.tokenIn, params.tokenOut, params.recipient, params.amountIn, amountOut);
        return amountOut;
    }
    
    function exactInput(ExactInputParams calldata params) external payable returns (uint256 amountOut) {
        require(block.timestamp <= params.deadline, "Transaction too old");
        require(params.amountIn > 0, "Amount must be greater than 0");
        
        // For simplicity, we'll just return a mock amount
        amountOut = params.amountIn * 95 / 100; // 5% slippage mock
        
        emit Swap(address(0), address(0), params.recipient, params.amountIn, amountOut);
        return amountOut;
    }
    
    struct ExactOutputSingleParams {
        address tokenIn;
        address tokenOut;
        uint24 fee;
        address recipient;
        uint256 deadline;
        uint256 amountOut;
        uint256 amountInMaximum;
        uint160 sqrtPriceLimitX96;
    }
    
    function exactOutputSingle(ExactOutputSingleParams calldata params) external payable returns (uint256 amountIn) {
        require(block.timestamp <= params.deadline, "Transaction too old");
        require(params.amountOut > 0, "Amount must be greater than 0");
        
        // Mock calculation
        uint256 rate = mockRates[params.tokenIn][params.tokenOut];
        if (rate == 0) {
            rate = 1e18; // Default 1:1 rate if not set
        }
        
        amountIn = (params.amountOut * 1e18) / rate;
        require(amountIn <= params.amountInMaximum, "Excessive input amount");
        
        emit Swap(params.tokenIn, params.tokenOut, params.recipient, amountIn, params.amountOut);
        return amountIn;
    }
    
    // Admin functions to set mock rates for testing
    function setMockRate(address tokenIn, address tokenOut, uint256 rate) external {
        mockRates[tokenIn][tokenOut] = rate;
    }
    
    function setMockLiquidity(address token, uint256 liquidity) external {
        mockLiquidity[token] = liquidity;
    }
    
    // Mock function to simulate quote
    function quoteExactInputSingle(
        address tokenIn,
        address tokenOut,
        uint24 fee,
        uint256 amountIn,
        uint160 sqrtPriceLimitX96
    ) external view returns (uint256 amountOut) {
        uint256 rate = mockRates[tokenIn][tokenOut];
        if (rate == 0) {
            rate = 1e18; // Default 1:1 rate if not set
        }
        
        return (amountIn * rate) / 1e18;
    }
    
    // Allow the contract to receive ETH
    receive() external payable {}
}
