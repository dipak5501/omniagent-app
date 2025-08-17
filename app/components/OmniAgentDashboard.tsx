'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import type {
  DAOTreasury,
  GovernanceProposal,
  TreasuryAsset,
} from '@/lib/ai-agent';
import { useProposals } from '@/lib/providers';

interface TreasuryAnalysis {
  analysis: string;
}

interface ProposalValidation {
  isValid: boolean;
  issues: string[];
  suggestions: string[];
}

export default function OmniAgentDashboard() {
  const { addApprovedProposal } = useProposals();

  const [treasury, setTreasury] = useState<DAOTreasury>({
    assets: [
      { token: 'ETH', amount: 100, chain: 'ethereum', valueUSD: 200000 },
      { token: 'USDC', amount: 20000, chain: 'ethereum', valueUSD: 20000 },
    ],
    totalValueUSD: 220000,
    goals: ['Earn yield with low risk', 'Improve asset efficiency'],
    riskTolerance: 'low',
  });

  const [analysis, setAnalysis] = useState<string>('');
  const [proposals, setProposals] = useState<GovernanceProposal[]>([]);
  const [validations, setValidations] = useState<
    Record<string, ProposalValidation>
  >({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const addAsset = () => {
    setTreasury((prev) => ({
      ...prev,
      assets: [...prev.assets, { token: '', amount: 0, chain: 'ethereum' }],
    }));
  };

  const updateAsset = (
    index: number,
    field: keyof TreasuryAsset,
    value: any
  ) => {
    setTreasury((prev) => {
      return {
        ...prev,
        assets: prev.assets.map((asset, i) =>
          i === index ? { ...asset, [field]: value } : asset
        ),
      };
    });
  };

  const removeAsset = (index: number) => {
    setTreasury((prev) => {
      return {
        ...prev,
        assets: prev.assets.filter((_, i) => i !== index),
      };
    });
  };

  const analyzeTreasury = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/agent/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(treasury),
      });

      if (response.ok) {
        const data: TreasuryAnalysis = await response.json();
        setAnalysis(data.analysis);
      } else {
        console.error('Analysis failed');
      }
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateProposals = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/agent/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ treasury, count: 3 }),
      });

      if (response.ok) {
        const data = await response.json();
        setProposals(data.proposals || []);
      } else {
        console.error('Proposal generation failed');
      }
    } catch (error) {
      console.error('Generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const validateProposal = async (proposal: GovernanceProposal) => {
    setIsValidating(true);
    try {
      const response = await fetch('/api/agent/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposal, treasury }),
      });

      if (response.ok) {
        const data = await response.json();
        setValidations((prev) => ({
          ...prev,
          [proposal.title]: data.validation,
        }));
      } else {
        console.error('Validation failed');
      }
    } catch (error) {
      console.error('Validation error:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800';
    if (confidence >= 0.6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const handleApproveProposal = (proposal: GovernanceProposal) => {
    // Convert GovernanceProposal to Proposal format for DAO dashboard
    const proposalToAdd = {
      id: Date.now().toString(),
      title: proposal.title,
      description: proposal.description,
      status: 'pending' as const,
      votesFor: 0,
      votesAgainst: 0,
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      creator: 'AI Generated',
      target: proposal.targetContract,
      calldata: '0x', // Placeholder - would be generated from function call
      value: proposal.valueInETH
        ? (proposal.valueInETH * 1e18).toString()
        : '0',
      sourceChain: proposal.sourceChain,
      targetChain: proposal.targetChain,
      targetContract: proposal.targetContract,
      functionName: proposal.functionName,
      payable: proposal.payable,
      arguments: proposal.arguments,
      valueInETH: proposal.valueInETH,
      support: proposal.support,
      confidence: proposal.confidence,
      reason: proposal.reason,
    };

    addApprovedProposal(proposalToAdd);
    alert('Proposal approved and moved to DAO Dashboard!');
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">OmniAgent Dashboard</h1>
          <p className="text-muted-foreground">
            AI-powered DAO treasury analysis and governance proposals
          </p>
        </div>
      </div>

      {/* Treasury Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Treasury Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Total Value (USD)</Label>
              <Input
                type="number"
                value={treasury.totalValueUSD || ''}
                onChange={(e) =>
                  setTreasury((prev) => ({
                    ...prev,
                    totalValueUSD: parseFloat(e.target.value) || undefined,
                  }))
                }
                placeholder="Total treasury value"
              />
            </div>
            <div>
              <Label>Risk Tolerance</Label>
              <select
                className="w-full p-2 border rounded-md"
                value={treasury.riskTolerance || 'medium'}
                onChange={(e) =>
                  setTreasury((prev) => ({
                    ...prev,
                    riskTolerance: e.target.value as 'low' | 'medium' | 'high',
                  }))
                }
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <Label>Goals</Label>
              <Input
                value={treasury.goals?.join(', ') || ''}
                onChange={(e) =>
                  setTreasury((prev) => ({
                    ...prev,
                    goals: e.target.value
                      .split(',')
                      .map((g) => g.trim())
                      .filter((g) => g),
                  }))
                }
                placeholder="Earn yield, reduce risk..."
              />
            </div>
            <div className="flex items-end">
              <Button onClick={addAsset} className="w-full">
                Add Asset
              </Button>
            </div>
          </div>

          {/* Assets List */}
          <div className="space-y-2">
            <Label>Assets</Label>
            {treasury.assets.map((asset, index) => (
              <div
                key={`asset-${index}-${asset.token}`}
                className="grid grid-cols-1 md:grid-cols-5 gap-2 items-end"
              >
                <Input
                  placeholder="Token (e.g., ETH)"
                  value={asset.token}
                  onChange={(e) => updateAsset(index, 'token', e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Amount"
                  value={asset.amount}
                  onChange={(e) =>
                    updateAsset(
                      index,
                      'amount',
                      parseFloat(e.target.value) || 0
                    )
                  }
                />
                <select
                  className="p-2 border rounded-md"
                  value={asset.chain}
                  onChange={(e) => updateAsset(index, 'chain', e.target.value)}
                >
                  <option value="ethereum">Ethereum</option>
                  <option value="polygon">Polygon</option>
                  <option value="arbitrum">Arbitrum</option>
                  <option value="optimism">Optimism</option>
                  <option value="base">Base</option>
                </select>
                <Input
                  type="number"
                  placeholder="Value USD"
                  value={asset.valueUSD || ''}
                  onChange={(e) =>
                    updateAsset(
                      index,
                      'valueUSD',
                      parseFloat(e.target.value) || undefined
                    )
                  }
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeAsset(index)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Button onClick={analyzeTreasury} disabled={isAnalyzing}>
              {isAnalyzing ? 'Analyzing...' : 'Analyze Treasury'}
            </Button>
            <Button onClick={generateProposals} disabled={isGenerating}>
              {isGenerating ? 'Generating...' : 'Generate Proposals'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Treasury Analysis */}
      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle>AI Treasury Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap text-sm">{analysis}</div>
          </CardContent>
        </Card>
      )}

      {/* Generated Proposals */}
      {proposals.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">AI-Generated Proposals</h2>
          {proposals.map((proposal, index) => (
            <Card key={`proposal-${index}-${proposal.title}`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {proposal.title}
                      <Badge
                        className={getConfidenceColor(proposal.confidence)}
                      >
                        {Math.round(proposal.confidence * 100)}% Confidence
                      </Badge>
                      <Badge
                        variant={proposal.support ? 'default' : 'destructive'}
                      >
                        {proposal.support ? 'SUPPORT' : 'OPPOSE'}
                      </Badge>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {proposal.sourceChain} → {proposal.targetChain}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => validateProposal(proposal)}
                      disabled={isValidating}
                    >
                      {isValidating ? 'Validating...' : 'Validate'}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleApproveProposal(proposal)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Approve & Move to DAO
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{proposal.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Target Contract:</strong> {proposal.targetContract}
                  </div>
                  <div>
                    <strong>Function:</strong> {proposal.functionName}
                  </div>
                  <div>
                    <strong>Value:</strong> {proposal.valueInETH || 0} ETH
                  </div>
                  <div>
                    <strong>Payable:</strong> {proposal.payable ? 'Yes' : 'No'}
                  </div>
                </div>

                <div>
                  <strong>Rationale:</strong>
                  <p className="text-sm text-muted-foreground mt-1">
                    {proposal.reason}
                  </p>
                </div>

                {/* Validation Results */}
                {validations[proposal.title] && (
                  <div className="mt-4 p-4 border rounded-md">
                    <h4 className="font-semibold mb-2">Validation Results</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            validations[proposal.title].isValid
                              ? 'default'
                              : 'destructive'
                          }
                        >
                          {validations[proposal.title].isValid
                            ? 'Valid'
                            : 'Invalid'}
                        </Badge>
                      </div>
                      {validations[proposal.title].issues.length > 0 && (
                        <div>
                          <strong>Issues:</strong>
                          <ul className="list-disc list-inside text-sm text-red-600">
                            {validations[proposal.title].issues.map(
                              (issue, i) => (
                                <li key={`issue-${i}-${issue}`}>{issue}</li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                      {validations[proposal.title].suggestions.length > 0 && (
                        <div>
                          <strong>Suggestions:</strong>
                          <ul className="list-disc list-inside text-sm text-blue-600">
                            {validations[proposal.title].suggestions.map(
                              (suggestion, i) => (
                                <li key={`suggestion-${i}-${suggestion}`}>
                                  {suggestion}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
