import { type NextRequest, NextResponse } from 'next/server';
import {
  type DAOTreasury,
  type GovernanceProposal,
  OmniAgent,
} from '@/lib/ai-agent';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const {
      proposal,
      treasury,
    }: { proposal: GovernanceProposal; treasury: DAOTreasury } =
      await request.json();

    if (!proposal) {
      return NextResponse.json(
        { error: 'Proposal data is required' },
        { status: 400 }
      );
    }

    const agent = new OmniAgent(treasury);
    const validation = await agent.validateProposal(proposal);

    return NextResponse.json({ validation });
  } catch (error) {
    console.error('Validation error:', error);
    return NextResponse.json(
      { error: 'Failed to validate proposal' },
      { status: 500 }
    );
  }
}
