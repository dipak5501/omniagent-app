import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

export default buildModule('MockContractsWithUSDCModule', (m) => {
  // First deploy MockUSDC
  const mockUSDC = m.contract('MockUSDC');

  // Deploy mock contracts
  const mockAaveLendingPool = m.contract('MockAaveLendingPool');
  const mockUniswapV3Router = m.contract('MockUniswapV3Router');
  const mockCompoundComptroller = m.contract('MockCompoundComptroller');

  // Set up default rates for the mock contracts using the deployed USDC address
  m.call(mockAaveLendingPool, 'setReserveBorrowRate', [
    mockUSDC, // Use the deployed USDC address
    '50000000000000000', // 5% APY
  ]);

  m.call(mockAaveLendingPool, 'setReserveLiquidityRate', [
    mockUSDC, // Use the deployed USDC address
    '20000000000000000', // 2% APY
  ]);

  // Set Uniswap rates
  m.call(mockUniswapV3Router, 'setMockRate', [
    '0x0000000000000000000000000000000000000000', // ETH
    mockUSDC, // Use the deployed USDC address
    '1800000000000000000', // 1 ETH = 1800 USDC
  ]);

  // Set Compound rates
  m.call(mockCompoundComptroller, 'setBorrowRate', [
    mockUSDC, // Use the deployed USDC address
    '40000000000000000', // 4% APY
  ]);

  m.call(mockCompoundComptroller, 'setSupplyRate', [
    mockUSDC, // Use the deployed USDC address
    '15000000000000000', // 1.5% APY
  ]);

  return {
    mockUSDC,
    mockAaveLendingPool,
    mockUniswapV3Router,
    mockCompoundComptroller,
  };
});
