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
You are an expert DAO governance strategist. Based on the following treasury data, generate a specific governance proposal for execution on Saga chain:

Treasury Assets:
${this.treasury.assets
  .map(
    (asset) =>
      `- ${asset.amount} ${asset.token} on ${asset.chain}${asset.valueUSD ? ` ($${asset.valueUSD.toLocaleString()})` : ''}`
  )
  .join('\n')}

Goals: ${this.treasury.goals?.join(', ') || 'Optimize treasury yield and efficiency'}
Risk Tolerance: ${this.treasury.riskTolerance || 'medium'}

      IMPORTANT: This proposal will be executed on Saga chain. Use these deployed mock contract addresses:
      
      - Mock Aave LendingPool: 0xc97885b31e9b230526A902963aE5c6c1cF98acEC (for lending operations)
      - Mock Uniswap Router: 0xB64D7975c092FB1ea466f010021d41aa7F15C529 (for swaps)
      - Mock Compound: 0x8700f2999BE4492D1E972A1c0ad0FcA4dD7Ce662 (for lending)
      - Mock USDC: 0x2D82Ca4d232f79e259c874a4C2131Fc1D581fedf (for token operations)

      CRITICAL: Saga chain has limited EVM opcode support. Use only basic function calls:
      - For Aave: use "deposit" function only
      - For Uniswap: use "exactInputSingle" function only  
      - For Compound: use "enterMarkets" function only
      - Avoid complex parameter structures or advanced opcodes

Generate a specific proposal that includes:
1. A clear action (staking, swapping, lending, etc.)
2. Target chain should be "saga"
3. Use the mock contract addresses above directly
4. Specific function calls that work with the mock contracts
5. Risk assessment and confidence level
6. Detailed rationale

Return ONLY a valid JSON object in this exact format:
{
  "title": "Brief descriptive title",
  "description": "Detailed description of the action",
  "sourceChain": "ethereum",
  "targetChain": "saga", 
  "targetContract": "0x4dEb592A7CD57a4b4f4bBAB6A0050F6776697D04 (use deployed mock addresses above)",
  "functionName": "deposit",
  "payable": false,
        "arguments": ["0x2D82Ca4d232f79e259c874a4C2131Fc1D581fedf", "1000000", "0x77937516b5E9d01771F6D11466962975785CE57B", "0"],
  "valueInETH": 0,
  "support": true,
  "confidence": 0.9,
  "reason": "Detailed rationale for this proposal"
}

CRITICAL REQUIREMENTS:
1. ALWAYS use a real function name from the contract (deposit, borrow, withdraw, swap, etc.)
2. ALWAYS provide proper arguments for the function
3. NEVER use empty arguments array []
4. NEVER use placeholder function names like "functionName"
5. Use the correct contract address based on the function:
   - For Aave functions (deposit, borrow, withdraw): use Mock Aave address 0x4dEb592A7CD57a4b4f4bBAB6A0050F6776697D04
   - For Uniswap functions (swap, exactInputSingle): use Mock Uniswap address 0xBCD5c12B60383f99aBCED8570b36C20f1050AAAC
   - For Compound functions (enterMarkets, exitMarket): use Mock Compound address 0x18B7171F32cE584067FA3e253763345Ed7e11a23

EXAMPLE FUNCTION CALLS:
- Aave deposit: functionName="deposit", arguments=["0x0781597f78F81F0112741596ECC8eB079d538f57", "1000000000", "0x77937516b5E9d01771F6D11466962975785CE57B", "0"]
- Uniswap swap: functionName="exactInputSingle", arguments=[{"tokenIn":"0x0000000000000000000000000000000000000000","tokenOut":"0x0781597f78F81F0112741596ECC8eB079d538f57","fee":"3000","recipient":"0x77937516b5E9d01771F6D11466962975785CE57B","deadline":"1735689600","amountIn":"1000000000000000000","amountOutMinimum":"0","sqrtPriceLimitX96":"0"}]
- Compound enter: functionName="enterMarkets", arguments=[["0x0781597f78F81F0112741596ECC8eB079d538f57"]]

Focus on practical, executable actions using the mock contracts on Saga chain.
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
