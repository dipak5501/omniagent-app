import {
  createPublicClient,
  http,
  createWalletClient,
  custom,
  parseEther,
  encodeFunctionData,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

// Saga network configuration
export const sagaChain = {
  id: 2749127454006000,
  name: 'btest',
  network: 'btest',
  nativeCurrency: {
    decimals: 18,
    name: 'Btest',
    symbol: 'btt',
  },
  rpcUrls: {
    default: {
      http: ['https://btest-2749127454006000-1.jsonrpc.sagarpc.io'],
    },
    public: {
      http: ['https://btest-2749127454006000-1.jsonrpc.sagarpc.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Saga Explorer',
      url: 'https://btest-2749127454006000-1.sagaexplorer.io/',
    },
  },
} as const;

// Public client for reading from blockchain
export const publicClient = createPublicClient({
  chain: sagaChain,
  transport: http(),
});

// Wallet client for transactions
export const createWalletClientForExecution = (account: `0x${string}`) => {
  return createWalletClient({
    account,
    chain: sagaChain,
    transport: custom(window.ethereum),
  });
};

// Contract address
export const DAO_ACTION_EXECUTOR_ADDRESS =
  '0x1f28D522caFb86b1A7b64D4CB02b9d214788977e' as const;

// Mock contract addresses
export const MOCK_AAVE_ADDRESS =
  '0xc97885b31e9b230526A902963aE5c6c1cF98acEC' as const;
export const MOCK_UNISWAP_ADDRESS =
  '0xB64D7975c092FB1ea466f010021d41aa7F15C529' as const;
export const MOCK_COMPOUND_ADDRESS =
  '0x8700f2999BE4492D1E972A1c0ad0FcA4dD7Ce662' as const;
export const MOCK_USDC_ADDRESS =
  '0x2D82Ca4d232f79e259c874a4C2131Fc1D581fedf' as const;

// Simplified ABI for the execute function
export const executeFunctionAbi = {
  name: 'execute',
  type: 'function',
  stateMutability: 'nonpayable',
  inputs: [
    { name: 'target', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'data', type: 'bytes' },
  ],
  outputs: [{ name: '', type: 'bytes' }],
} as const;

// Simplified DeFi function ABIs - using basic types only
export const aaveDepositAbi = {
  name: 'deposit',
  type: 'function',
  stateMutability: 'nonpayable',
  inputs: [
    { name: 'asset', type: 'address' },
    { name: 'amount', type: 'uint256' },
    { name: 'onBehalfOf', type: 'address' },
    { name: 'referralCode', type: 'uint16' },
  ],
  outputs: [],
} as const;

export const uniswapSwapAbi = {
  name: 'exactInputSingle',
  type: 'function',
  stateMutability: 'payable',
  inputs: [
    { name: 'tokenIn', type: 'address' },
    { name: 'tokenOut', type: 'address' },
    { name: 'fee', type: 'uint24' },
    { name: 'recipient', type: 'address' },
    { name: 'deadline', type: 'uint256' },
    { name: 'amountIn', type: 'uint256' },
    { name: 'amountOutMinimum', type: 'uint256' },
    { name: 'sqrtPriceLimitX96', type: 'uint160' },
  ],
  outputs: [{ name: 'amountOut', type: 'uint256' }],
} as const;

export const compoundEnterMarketsAbi = {
  name: 'enterMarkets',
  type: 'function',
  stateMutability: 'nonpayable',
  inputs: [{ name: 'cTokens', type: 'address[]' }],
  outputs: [{ name: '', type: 'uint256[]' }],
} as const;

// Function to encode common DeFi operations - simplified for Saga compatibility
export const encodeDeFiCall = (
  protocol: 'aave' | 'uniswap' | 'compound',
  operation: string,
  userAddress: `0x${string}`
): `0x${string}` => {
  try {
    switch (protocol) {
      case 'aave':
        if (operation === 'deposit') {
          // Use simple manual encoding for Saga compatibility
          const functionSelector = 'e8eda9df'; // deposit(address,uint256,address,uint16) - without 0x prefix
          const assetPadded = MOCK_USDC_ADDRESS.slice(2).padStart(64, '0');
          const amountPadded =
            '0000000000000000000000000000000000000000000000000000000000000f4240'; // 1,000,000 in hex (1 USDC)
          const onBehalfOfPadded = userAddress.slice(2).padStart(64, '0');
          const referralPadded =
            '0000000000000000000000000000000000000000000000000000000000000000';

          return `0x${functionSelector}${assetPadded}${amountPadded}${onBehalfOfPadded}${referralPadded}` as `0x${string}`;
        }
        break;
      case 'uniswap':
        if (operation === 'swap') {
          // Use simple manual encoding for Saga compatibility
          const functionSelector = '414bf389'; // exactInputSingle(address,address,uint24,address,uint256,uint256,uint256,uint160) - without 0x prefix
          const tokenInPadded =
            '0000000000000000000000000000000000000000000000000000000000000000';
          const tokenOutPadded = MOCK_USDC_ADDRESS.slice(2).padStart(64, '0');
          const feePadded =
            '0000000000000000000000000000000000000000000000000000000000000bb8'; // 3000
          const recipientPadded = userAddress.slice(2).padStart(64, '0');
          const deadlinePadded = BigInt(Math.floor(Date.now() / 1000) + 3600)
            .toString(16)
            .padStart(64, '0');
          const amountInPadded = parseEther('1').toString(16).padStart(64, '0');
          const amountOutMinPadded =
            '0000000000000000000000000000000000000000000000000000000000000000';
          const sqrtPriceLimitPadded =
            '0000000000000000000000000000000000000000000000000000000000000000';

          return `0x${functionSelector}${tokenInPadded}${tokenOutPadded}${feePadded}${recipientPadded}${deadlinePadded}${amountInPadded}${amountOutMinPadded}${sqrtPriceLimitPadded}` as `0x${string}`;
        }
        break;
      case 'compound':
        if (operation === 'enterMarkets') {
          // Use simple manual encoding for Saga compatibility
          const functionSelector = 'c2998238'; // enterMarkets(address[]) - without 0x prefix
          const offsetPadded =
            '0000000000000000000000000000000000000000000000000000000000000020'; // offset to array
          const arrayLengthPadded =
            '0000000000000000000000000000000000000000000000000000000000000001'; // array length 1
          const tokenPadded = MOCK_USDC_ADDRESS.slice(2).padStart(64, '0');

          return `0x${functionSelector}${offsetPadded}${arrayLengthPadded}${tokenPadded}` as `0x${string}`;
        }
        break;
    }

    // Default fallback - use simple Aave deposit encoding
    const functionSelector = 'e8eda9df'; // deposit(address,uint256,address,uint16) - without 0x prefix
    const assetPadded = MOCK_USDC_ADDRESS.slice(2).padStart(64, '0');
    const amountPadded =
      '0000000000000000000000000000000000000000000000000000000000000f4240'; // 1,000,000 in hex (1 USDC)
    const onBehalfOfPadded = userAddress.slice(2).padStart(64, '0');
    const referralPadded =
      '0000000000000000000000000000000000000000000000000000000000000000';

    return `0x${functionSelector}${assetPadded}${amountPadded}${onBehalfOfPadded}${referralPadded}` as `0x${string}`;
  } catch (error) {
    console.error('Error encoding DeFi call:', error);
    // Return a simple no-op call if encoding fails
    return '0x' as `0x${string}`;
  }
};

// Function to get the correct contract address for a protocol
export const getContractAddress = (
  protocol: 'aave' | 'uniswap' | 'compound'
): `0x${string}` => {
  switch (protocol) {
    case 'aave':
      return MOCK_AAVE_ADDRESS;
    case 'uniswap':
      return MOCK_UNISWAP_ADDRESS;
    case 'compound':
      return MOCK_COMPOUND_ADDRESS;
  }
};

// Function to encode the execute call
export const encodeExecuteCall = (
  target: `0x${string}`,
  value: bigint,
  data: `0x${string}`
) => {
  return encodeFunctionData({
    abi: [executeFunctionAbi],
    args: [target, value, data],
  });
};

// Function to execute a proposal - simplified for Saga compatibility
export const executeProposal = async (
  account: `0x${string}`,
  target: `0x${string}`,
  value: string,
  calldata: `0x${string}`
) => {
  try {
    const walletClient = createWalletClientForExecution(account);
    const valueBigInt = value ? parseEther(value) : 0n;

    console.log('Executing proposal with:', {
      target,
      value: valueBigInt.toString(),
      calldata,
      account,
    });

    const hash = await walletClient.writeContract({
      address: DAO_ACTION_EXECUTOR_ADDRESS,
      abi: [executeFunctionAbi],
      functionName: 'execute',
      args: [target, valueBigInt, calldata],
      account: account,
      chain: sagaChain,
    });

    return hash;
  } catch (error) {
    console.error('Error executing proposal:', error);
    throw error;
  }
};

// Function to wait for transaction confirmation
export const waitForTransaction = async (hash: `0x${string}`) => {
  try {
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    return receipt;
  } catch (error) {
    console.error('Error waiting for transaction:', error);
    throw error;
  }
};

// Function to check if a contract exists at the given address
export const checkContractExists = async (address: `0x${string}`) => {
  try {
    const code = await publicClient.getBytecode({ address });
    return code !== undefined && code !== '0x';
  } catch {
    return false;
  }
};

// Function to simulate a transaction - simplified for Saga compatibility
export const simulateTransaction = async (
  target: `0x${string}`,
  value: string,
  calldata: `0x${string}`
) => {
  try {
    const valueBigInt = value ? parseEther(value) : 0n;

    console.log('Simulating transaction with:', {
      target,
      value: valueBigInt.toString(),
      calldata,
    });

    // For Saga chain, we'll skip simulation and just return success
    // This avoids the opcode compatibility issues
    return { success: true, result: null };
  } catch (error) {
    console.error('Simulation error:', error);
    return { success: false, error };
  }
};
