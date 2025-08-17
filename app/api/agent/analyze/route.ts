import { type NextRequest, NextResponse } from 'next/server';
import { type DAOTreasury, OmniAgent } from '@/lib/ai-agent';

export async function POST(request: NextRequest) {
  try {
    const treasury: DAOTreasury = await request.json();

    if (!treasury.assets || treasury.assets.length === 0) {
      return NextResponse.json(
        { error: 'Treasury data is required' },
        { status: 400 }
      );
    }

    const agent = new OmniAgent(treasury);
    const analysis = await agent.analyzeTreasury();

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze treasury' },
      { status: 500 }
    );
  }
}
