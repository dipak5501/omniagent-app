import { NextResponse } from 'next/server';

export async function POST() {
  // Simulate AI-generated proposals
  const proposals = [
    {
      id: Date.now().toString(),
      description: 'Stake 50 ETH in Lido',
      target: '0xLidoStakingAddress',
      status: 'pending',
    },
    {
      id: (Date.now() + 1).toString(),
      description: 'Swap 10,000 USDC to DAI',
      target: '0xUniswapRouter',
      status: 'pending',
    },
  ];

  return NextResponse.json(proposals);
}
