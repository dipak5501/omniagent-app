import { NextResponse } from 'next/server';

export async function GET() {
  // Test endpoint to verify the system is working
  const testTreasury = {
    assets: [
      { token: 'ETH', amount: 100, chain: 'ethereum', valueUSD: 200000 },
      { token: 'USDC', amount: 20000, chain: 'ethereum', valueUSD: 20000 },
    ],
    totalValueUSD: 220000,
    goals: ['Earn yield with low risk', 'Improve asset efficiency'],
    riskTolerance: 'low' as const,
  };

  const testProposal = {
    title: 'Stake ETH in Lido via Polygon',
    description:
      'Stake 50 ETH via Lido stETH wrapper deployed on Polygon for better L2 gas efficiency.',
    sourceChain: 'ethereum',
    targetChain: 'polygon',
    targetContract: '0x1F32b1c2345538c0c6f582fCB022739c4A194Ebb',
    functionName: 'stakeETH',
    payable: true,
    arguments: [],
    valueInETH: 50,
    support: true,
    confidence: 0.91,
    reason:
      'Polygon offers lower gas costs. Lido is safe. Treasury is overcapitalized in ETH.',
  };

  return NextResponse.json({
    message: 'OmniAgent system is working',
    testTreasury,
    testProposal,
    endpoints: {
      analyze: '/api/agent/analyze',
      generate: '/api/agent/generate',
      verify: '/api/agent/verify',
    },
  });
}
