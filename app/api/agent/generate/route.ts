import { type NextRequest, NextResponse } from 'next/server';
import { type DAOTreasury, OmniAgent } from '@/lib/ai-agent';

export async function POST(request: NextRequest) {
  try {
    const { treasury, count = 1 }: { treasury: DAOTreasury; count?: number } =
      await request.json();

    if (!treasury.assets || treasury.assets.length === 0) {
      return NextResponse.json(
        { error: 'Treasury data is required' },
        { status: 400 }
      );
    }

    const agent = new OmniAgent(treasury);

    if (count === 1) {
      const proposal = await agent.generateProposal();
      return NextResponse.json({ proposal });
    } else {
      const proposals = await agent.generateMultipleProposals(count);
      return NextResponse.json({ proposals });
    }
  } catch (error) {
    console.error('Proposal generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate proposal' },
      { status: 500 }
    );
  }
}
