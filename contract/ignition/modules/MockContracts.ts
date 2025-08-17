import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

export default buildModule('MockContractsModule', (m) => {
  // Deploy mock contracts
  const mockAaveLendingPool = m.contract('MockAaveLendingPool');
  const mockUniswapV3Router = m.contract('MockUniswapV3Router');
  const mockCompoundComptroller = m.contract('MockCompoundComptroller');

  // Set up default rates for the mock contracts
  const mockUSDC = '0x0781597f78F81F0112741596ECC8eB079d538f57'; // Mock USDC address

  // Set Aave rates
  m.call(mockAaveLendingPool, 'setReserveBorrowRate', [
    mockUSDC,
    '50000000000000000', // 5% APY
  ]);

  m.call(mockAaveLendingPool, 'setReserveLiquidityRate', [
    mockUSDC,
    '20000000000000000', // 2% APY
  ]);

  // Set Uniswap rates
  m.call(mockUniswapV3Router, 'setMockRate', [
    '0x0000000000000000000000000000000000000000', // ETH
    mockUSDC,
    '1800000000000000000', // 1 ETH = 1800 USDC
  ]);

  // Set Compound rates
  m.call(mockCompoundComptroller, 'setBorrowRate', [
    mockUSDC,
    '40000000000000000', // 4% APY
  ]);

  m.call(mockCompoundComptroller, 'setSupplyRate', [
    mockUSDC,
    '15000000000000000', // 1.5% APY
  ]);

  return {
    mockAaveLendingPool,
    mockUniswapV3Router,
    mockCompoundComptroller,
  };
});
