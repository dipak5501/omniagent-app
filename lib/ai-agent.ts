import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface TreasuryAsset {
  token: string;
  amount: number;
  chain: string;
  valueUSD?: number;
}

export interface DAOTreasury {
  assets: TreasuryAsset[];
  totalValueUSD?: number;
  goals?: string[];
  riskTolerance?: 'low' | 'medium' | 'high';
}

export interface GovernanceProposal {
  title: string;
  description: string;
  sourceChain: string;
  targetChain: string;
  targetContract: string;
  functionName: string;
  payable: boolean;
  arguments: string[]; // Changed from any[] to string[]
  valueInETH?: number;
  support: boolean;
  confidence: number;
  reason: string;
}

export class OmniAgent {
  private treasury: DAOTreasury;

  constructor(treasury: DAOTreasury) {
    this.treasury = treasury;
  }

  async analyzeTreasury(): Promise<string> {
    const prompt = `
You are an expert DAO treasury analyst. Analyze the following DAO treasury data and provide insights:

Treasury Assets:
${this.treasury.assets
  .map(
    (asset) =>
      `- ${asset.amount} ${asset.token} on ${asset.chain}${asset.valueUSD ? ` ($${asset.valueUSD.toLocaleString()})` : ''}`
  )
  .join('\n')}

Total Value: ${this.treasury.totalValueUSD ? `$${this.treasury.totalValueUSD.toLocaleString()}` : 'Unknown'}
Goals: ${this.treasury.goals?.join(', ') || 'Not specified'}
Risk Tolerance: ${this.treasury.riskTolerance || 'Not specified'}

Please provide:
1. Current treasury health assessment
2. Key opportunities and risks
3. Recommended actions for optimization
4. Cross-chain opportunities

Respond in a clear, structured format.
`;

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'You are an expert DAO treasury analyst with deep knowledge of DeFi protocols, cross-chain bridges, and governance strategies.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 1000,
      });

      return completion.choices[0]?.message?.content || 'Analysis failed';
    } catch (error) {
      console.error('OpenAI API error:', error);
      return 'Analysis failed due to API error';
    }
  }

  async generateProposal(): Promise<GovernanceProposal> {
    const prompt = `
You are an expert DAO governance strategist. Based on the following treasury data, generate a specific governance proposal:

Treasury Assets:
${this.treasury.assets
  .map(
    (asset) =>
      `- ${asset.amount} ${asset.token} on ${asset.chain}${asset.valueUSD ? ` ($${asset.valueUSD.toLocaleString()})` : ''}`
  )
  .join('\n')}

Goals: ${this.treasury.goals?.join(', ') || 'Optimize treasury yield and efficiency'}
Risk Tolerance: ${this.treasury.riskTolerance || 'medium'}

Generate a specific proposal that includes:
1. A clear action (staking, swapping, lending, etc.)
2. Source and target chains (consider gas efficiency)
3. Specific contract addresses and function calls
4. Risk assessment and confidence level
5. Detailed rationale

Return ONLY a valid JSON object in this exact format:
{
  "title": "Brief descriptive title",
  "description": "Detailed description of the action",
  "sourceChain": "ethereum|polygon|arbitrum|optimism|base",
  "targetChain": "ethereum|polygon|arbitrum|optimism|base", 
  "targetContract": "0x... (contract address)",
  "functionName": "functionName",
  "payable": true/false,
  "arguments": [],
  "valueInETH": 0,
  "support": true/false,
  "confidence": 0.0-1.0,
  "reason": "Detailed rationale for this proposal"
}

Focus on practical, executable actions with real contract addresses and function names.
`;

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'You are an expert DAO governance strategist. Always return valid JSON for proposals.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.2,
        max_tokens: 1500,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from OpenAI');
      }

      // Try to parse the JSON response
      try {
        const proposal = JSON.parse(response);
        return proposal as GovernanceProposal;
      } catch (_parseError) {
        console.error('Failed to parse proposal JSON:', response);
        throw new Error('Invalid proposal format');
      }
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw error;
    }
  }

  async generateMultipleProposals(
    count: number = 3
  ): Promise<GovernanceProposal[]> {
    const proposals: GovernanceProposal[] = [];

    for (let i = 0; i < count; i++) {
      try {
        const proposal = await this.generateProposal();
        proposals.push(proposal);
      } catch (error) {
        console.error(`Failed to generate proposal ${i + 1}:`, error);
      }
    }

    return proposals;
  }

  async validateProposal(proposal: GovernanceProposal): Promise<{
    isValid: boolean;
    issues: string[];
    suggestions: string[];
  }> {
    const prompt = `
Validate this DAO governance proposal:

${JSON.stringify(proposal, null, 2)}

Check for:
1. Valid contract addresses (should be 0x followed by 40 hex characters)
2. Realistic function names and parameters
3. Appropriate chain selection
4. Risk assessment accuracy
5. Executability of the proposal

Return JSON in this format:
{
  "isValid": true/false,
  "issues": ["list of issues found"],
  "suggestions": ["list of improvements"]
}
`;

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'You are an expert DAO proposal validator. Return only valid JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.1,
        max_tokens: 800,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No validation response');
      }

      return JSON.parse(response);
    } catch (error) {
      console.error('Validation error:', error);
      return {
        isValid: false,
        issues: ['Validation failed'],
        suggestions: ['Check proposal format'],
      };
    }
  }
}
