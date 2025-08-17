'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type {
  DAOTreasury,
  GovernanceProposal,
  TreasuryAsset,
} from '@/lib/ai-agent';
import { useProposals } from '@/lib/providers';
import ProposalLoadingOverlay from './ProposalLoadingOverlay';

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
    value: string | number
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

  const _getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) {
      return 'bg-green-100 text-green-800';
    }
    if (confidence >= 0.6) {
      return 'bg-yellow-100 text-yellow-800';
    }
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
    <div
      className={`w-full max-w-6xl mx-auto space-y-6 ${isGenerating ? 'pointer-events-none' : ''}`}
    >
      {/* Loading Overlay */}
      <ProposalLoadingOverlay isVisible={isGenerating} />
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">
            OmniAgent Dashboard
          </h1>
          <p className="text-white/80 text-base md:text-lg">
            AI-powered DAO treasury analysis and governance proposals
          </p>
        </div>
      </div>

      {/* Treasury Configuration */}
      <div className="border border-purple-500/30 bg-gradient-to-br from-purple-900/40 to-indigo-900/40 backdrop-blur-md rounded-2xl p-4 md:p-6 shadow-xl shadow-purple-500/10">
        <div className="mb-4 md:mb-6">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-2">
            Treasury Configuration
          </h2>
        </div>
        <div className="space-y-4 md:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <div>
              <Label className="text-white/90 text-sm md:text-base font-medium">
                Total Value (USD)
              </Label>
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
                className="h-12 bg-purple-900/30 border-purple-500/30 text-white placeholder:text-purple-200/60 focus:border-purple-400/50 focus:ring-purple-400/20"
              />
            </div>
            <div>
              <Label className="text-white/90 text-sm md:text-base font-medium">
                Risk Tolerance
              </Label>
              <select
                className="w-full h-12 px-3 border border-purple-500/30 rounded-xl bg-purple-900/30 text-white focus:border-purple-400/50 focus:ring-purple-400/20"
                value={treasury.riskTolerance || 'medium'}
                onChange={(e) =>
                  setTreasury((prev) => ({
                    ...prev,
                    riskTolerance: e.target.value as 'low' | 'medium' | 'high',
                  }))
                }
              >
                <option value="low" className="bg-slate-800">
                  Low
                </option>
                <option value="medium" className="bg-slate-800">
                  Medium
                </option>
                <option value="high" className="bg-slate-800">
                  High
                </option>
              </select>
            </div>
          </div>

          <div>
            <Label className="text-white/90 text-sm md:text-base font-medium">
              Goals
            </Label>
            <Input
              defaultValue={treasury.goals?.join(', ') || ''}
              onChange={(e) => {
                const inputValue = e.target.value;
                console.log('Goals input value:', inputValue); // Debug log
                // Only update when user finishes typing (on blur or enter)
              }}
              onBlur={(e) => {
                const inputValue = e.target.value;
                setTreasury((prev) => ({
                  ...prev,
                  goals: inputValue
                    .split(',')
                    .map((g) => g.trim())
                    .filter((g) => g.length > 0),
                }));
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const inputValue = e.currentTarget.value;
                  setTreasury((prev) => ({
                    ...prev,
                    goals: inputValue
                      .split(',')
                      .map((g) => g.trim())
                      .filter((g) => g.length > 0),
                  }));
                }
              }}
              placeholder="Earn yield, reduce risk..."
              className="bg-purple-900/30 border-purple-500/30 text-white placeholder:text-purple-200/60 focus:border-purple-400/50 focus:ring-purple-400/20"
            />
          </div>

          {/* Assets List */}
          <div className="space-y-3 md:space-y-4">
            <Label className="text-white/90 text-sm md:text-base font-medium">
              Assets
            </Label>

            {/* Column Headers */}
            <div className="hidden md:grid md:grid-cols-5 gap-0 md:gap-1 text-sm font-medium text-white/70 md:justify-items-center">
              <div>Token</div>
              <div>Amount</div>
              <div>Chain</div>
              <div>Value (USD)</div>
              <div>Action</div>
            </div>

            {treasury.assets.map((asset, index) => (
              <div
                key={`asset-${index}-${asset.amount}-${asset.chain}`}
                className="p-4 border border-purple-500/20 rounded-xl bg-purple-900/20 space-y-3 md:p-0 md:border-0 md:bg-transparent md:space-y-0 md:grid md:grid-cols-5 md:gap-0 md:gap-1 md:items-end md:justify-items-center"
              >
                <div className="space-y-2 md:space-y-1 w-full">
                  <Label className="md:hidden text-white/70 text-sm font-medium">
                    Token
                  </Label>
                  <Input
                    placeholder="Token (e.g., ETH)"
                    value={asset.token}
                    onChange={(e) =>
                      updateAsset(index, 'token', e.target.value)
                    }
                    className="h-12 w-full bg-purple-900/30 border-purple-500/30 text-white placeholder:text-purple-200/60 focus:border-purple-400/50 focus:ring-purple-400/20"
                  />
                </div>
                <div className="space-y-2 md:space-y-1 w-full">
                  <Label className="md:hidden text-white/70 text-sm font-medium">
                    Amount
                  </Label>
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
                    className="h-12 w-full bg-purple-900/30 border-purple-500/30 text-white placeholder:text-purple-200/60 focus:border-purple-400/50 focus:ring-purple-400/20"
                  />
                </div>
                <div className="space-y-2 md:space-y-1 w-full">
                  <Label className="md:hidden text-white/70 text-sm font-medium">
                    Chain
                  </Label>
                  <select
                    className="h-12 w-full px-3 border border-purple-500/30 rounded-xl bg-purple-900/30 text-white focus:border-purple-400/50 focus:ring-purple-400/20"
                    value={asset.chain}
                    onChange={(e) =>
                      updateAsset(index, 'chain', e.target.value)
                    }
                  >
                    <option value="ethereum" className="bg-slate-800">
                      Ethereum
                    </option>
                    <option value="polygon" className="bg-slate-800">
                      Polygon
                    </option>
                    <option value="arbitrum" className="bg-slate-800">
                      Arbitrum
                    </option>
                    <option value="optimism" className="bg-slate-800">
                      Optimism
                    </option>
                    <option value="base" className="bg-slate-800">
                      Base
                    </option>
                  </select>
                </div>
                <div className="space-y-2 md:space-y-1 w-full">
                  <Label className="md:hidden text-white/70 text-sm font-medium">
                    Value (USD)
                  </Label>
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
                    className="h-12 w-full bg-purple-900/30 border-purple-500/30 text-white placeholder:text-purple-200/60 focus:border-purple-400/50 focus:ring-purple-400/20"
                  />
                </div>
                <div className="space-y-2 md:space-y-1 w-full">
                  <Label className="md:hidden text-white/70 text-sm font-medium">
                    Action
                  </Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeAsset(index)}
                    className="h-12 w-full bg-purple-900/30 border-purple-500/30 hover:bg-purple-800/40 text-white rounded-xl"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 md:gap-3 justify-start mb-3 md:mb-4">
            <Button
              onClick={addAsset}
              className="bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white border-0 hover:from-indigo-600 hover:to-fuchsia-600 rounded-xl py-3 px-6"
            >
              Add Asset
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 md:gap-3 justify-center">
            <Button
              onClick={analyzeTreasury}
              disabled={isAnalyzing}
              className="bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white border-0 hover:from-indigo-600 hover:to-fuchsia-600 rounded-xl py-3 px-6"
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze Treasury'}
            </Button>
            <Button
              onClick={generateProposals}
              disabled={isGenerating}
              className={`rounded-xl py-3 px-6 transition-all duration-300 ${
                isGenerating
                  ? 'bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white/80 border-0 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white border-0 hover:from-indigo-600 hover:to-fuchsia-600'
              }`}
            >
              {isGenerating ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Generating...</span>
                </div>
              ) : (
                'Generate Proposals'
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Treasury Analysis */}
      {analysis && (
        <div className="border border-purple-500/30 bg-gradient-to-br from-purple-900/40 to-indigo-900/40 backdrop-blur-md rounded-2xl p-4 md:p-6 shadow-xl shadow-purple-500/10">
          <div className="mb-6">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-2">
              AI Treasury Analysis
            </h2>
          </div>
          <div className="whitespace-pre-wrap text-white/90 text-sm md:text-base leading-relaxed">
            {analysis}
          </div>
        </div>
      )}

      {/* Generated Proposals */}
      {proposals.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">
            AI-Generated Proposals
          </h2>
          {proposals.map((proposal, index) => (
            <div
              key={`proposal-${index}-${proposal.title}`}
              className="border border-purple-500/30 bg-gradient-to-br from-purple-900/40 to-indigo-900/40 backdrop-blur-md rounded-2xl p-6 shadow-xl shadow-purple-500/10"
            >
              <div className="mb-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-white mb-3 flex items-center gap-3">
                      {proposal.title}
                      <Badge
                        className={`${
                          proposal.confidence >= 0.8
                            ? 'bg-green-500/20 text-green-300 border-green-500/30'
                            : proposal.confidence >= 0.6
                              ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                              : 'bg-red-500/20 text-red-300 border-red-500/30'
                        } border rounded-full px-3 py-1 text-xs font-medium`}
                      >
                        {Math.round(proposal.confidence * 100)}% Confidence
                      </Badge>
                      <Badge
                        className={`${
                          proposal.support
                            ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                            : 'bg-red-500/20 text-red-300 border-red-500/30'
                        } border rounded-full px-3 py-1 text-xs font-medium`}
                      >
                        {proposal.support ? 'SUPPORT' : 'OPPOSE'}
                      </Badge>
                    </h3>
                    <p className="text-white/70 text-sm md:text-base">
                      {proposal.sourceChain} → {proposal.targetChain}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      size="sm"
                      onClick={() => validateProposal(proposal)}
                      disabled={isValidating}
                      className="bg-purple-900/30 border-purple-500/30 hover:bg-purple-800/40 text-white rounded-xl px-4 py-2"
                    >
                      {isValidating ? 'Validating...' : 'Validate'}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleApproveProposal(proposal)}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 hover:from-green-600 hover:to-emerald-600 rounded-xl px-4 py-2"
                    >
                      Approve & Move to DAO
                    </Button>
                  </div>
                </div>
              </div>
              <div className="space-y-4 md:space-y-6">
                <p className="text-white/90 text-sm md:text-base leading-relaxed">
                  {proposal.description}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm md:text-base">
                  <div className="text-white/80">
                    <strong className="text-white">Target Contract:</strong>{' '}
                    {proposal.targetContract}
                  </div>
                  <div className="text-white/80">
                    <strong className="text-white">Function:</strong>{' '}
                    {proposal.functionName}
                  </div>
                  <div className="text-white/80">
                    <strong className="text-white">Value:</strong>{' '}
                    {proposal.valueInETH || 0} ETH
                  </div>
                  <div className="text-white/80">
                    <strong className="text-white">Payable:</strong>{' '}
                    {proposal.payable ? 'Yes' : 'No'}
                  </div>
                </div>

                <div>
                  <strong className="text-white">Rationale:</strong>
                  <p className="text-white/80 text-sm md:text-base mt-2 leading-relaxed">
                    {proposal.reason}
                  </p>
                </div>

                {/* Validation Results */}
                {validations[proposal.title] && (
                  <div className="mt-6 p-4 border border-purple-500/30 rounded-xl bg-gradient-to-r from-purple-900/30 to-indigo-900/30">
                    <h4 className="font-semibold mb-3 text-white text-lg">
                      Validation Results
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge
                          className={`${
                            validations[proposal.title].isValid
                              ? 'bg-green-500/20 text-green-300 border-green-500/30'
                              : 'bg-red-500/20 text-red-300 border-red-500/30'
                          } border rounded-full px-3 py-1 text-xs font-medium`}
                        >
                          {validations[proposal.title].isValid
                            ? 'Valid'
                            : 'Invalid'}
                        </Badge>
                      </div>
                      {validations[proposal.title].issues.length > 0 && (
                        <div>
                          <strong className="text-white">Issues:</strong>
                          <ul className="list-disc list-inside text-sm text-red-300 mt-2">
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
                          <strong className="text-white">Suggestions:</strong>
                          <ul className="list-disc list-inside text-sm text-blue-300 mt-2">
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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
