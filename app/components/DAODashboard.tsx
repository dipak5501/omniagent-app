'use client';

import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { encodeFunctionData, parseEther } from 'viem';
import {
  useAccount,
  useReadContract,
  useSimulateContract,
  useWriteContract,
} from 'wagmi';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import DAOActionExecutorABI from '@/lib/abi/DAOActionExecutor.json';
import { useProposals } from '@/lib/providers';
import { logToHedera } from '../../lib/utils';

interface Proposal {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'passed' | 'failed' | 'pending' | 'executed';
  votesFor: number;
  votesAgainst: number;
  endDate: string;
  creator: string;
  target?: string;
  calldata?: string;
  value?: string;
}

// Contract address from deployment
const DAO_ACTION_EXECUTOR_ADDRESS =
  '0x5FbDB2315678afecb367f032d93F642f64180aa3';

export default function DAODashboard() {
  const { handleLogOut } = useDynamicContext();
  const router = useRouter();
  const { address } = useAccount();
  const { approvedProposals, updateProposal } = useProposals();

  // Combine approved proposals with some sample proposals for demo
  const [sampleProposals, setSampleProposals] = useState<Proposal[]>([
    {
      id: '1',
      title: 'Add New Token to Treasury',
      description:
        'Proposal to add USDC token to the DAO treasury for better liquidity management.',
      status: 'passed',
      votesFor: 1250,
      votesAgainst: 320,
      endDate: '2024-01-15',
      creator: '0x1234...5678',
      target: '0x1234567890123456789012345678901234567890',
      calldata: '0x',
      value: '0',
    },
    {
      id: '2',
      title: 'Update Governance Parameters',
      description:
        'Adjust voting period and quorum requirements for better governance efficiency.',
      status: 'pending',
      votesFor: 0,
      votesAgainst: 0,
      endDate: '2024-01-20',
      creator: '0x8765...4321',
    },
    {
      id: '3',
      title: 'Fund Development Team',
      description:
        'Allocate 100 ETH to development team for Q1 2024 initiatives.',
      status: 'passed',
      votesFor: 2100,
      votesAgainst: 150,
      endDate: '2024-01-10',
      creator: '0xabcd...efgh',
      target: '0xabcdabcdabcdabcdabcdabcdabcdabcdabcdabcd',
      calldata: '0x',
      value: parseEther('100').toString(),
    },
  ]);

  // Combine approved proposals with sample proposals
  const allProposals = [...approvedProposals, ...sampleProposals];

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProposal, setNewProposal] = useState({
    title: '',
    description: '',
    endDate: '',
  });
  const [simulationResults, setSimulationResults] = useState<{
    [key: string]: any;
  }>({});
  const [executionStatus, setExecutionStatus] = useState<{
    [key: string]: 'idle' | 'loading' | 'success' | 'error';
  }>({});

  // Contract write function
  const { writeContract, isPending: isExecuting } = useWriteContract();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'passed':
        return 'secondary';
      case 'failed':
        return 'destructive';
      case 'pending':
        return 'outline';
      case 'executed':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const handleCreateProposal = () => {
    if (newProposal.title && newProposal.description && newProposal.endDate) {
      const proposal: Proposal = {
        id: Date.now().toString(),
        title: newProposal.title,
        description: newProposal.description,
        status: 'pending',
        votesFor: 0,
        votesAgainst: 0,
        endDate: newProposal.endDate,
        creator: '0xYour...Wallet',
      };
      setSampleProposals([proposal, ...sampleProposals]);
      setNewProposal({ title: '', description: '', endDate: '' });
      setShowCreateForm(false);
    }
  };

  const handleVote = (proposalId: string, vote: 'for' | 'against') => {
    // Check if it's an approved proposal
    const approvedProposal = approvedProposals.find((p) => p.id === proposalId);
    if (approvedProposal) {
      updateProposal(proposalId, {
        votesFor:
          vote === 'for'
            ? approvedProposal.votesFor + 1
            : approvedProposal.votesFor,
        votesAgainst:
          vote === 'against'
            ? approvedProposal.votesAgainst + 1
            : approvedProposal.votesAgainst,
      });
    } else {
      // Update sample proposals
      setSampleProposals(
        sampleProposals.map((proposal) => {
          if (proposal.id === proposalId) {
            return {
              ...proposal,
              votesFor:
                vote === 'for' ? proposal.votesFor + 1 : proposal.votesFor,
              votesAgainst:
                vote === 'against'
                  ? proposal.votesAgainst + 1
                  : proposal.votesAgainst,
            };
          }
          return proposal;
        })
      );
    }
  };

  const handleSimulate = async (proposal: Proposal) => {
    if (!proposal.target || !proposal.calldata) {
      setSimulationResults((prev) => ({
        ...prev,
        [proposal.id]: {
          error: 'No target or calldata available for this proposal',
        },
      }));
      return;
    }

    try {
      setSimulationResults((prev) => ({
        ...prev,
        [proposal.id]: { loading: true },
      }));

      // Simulate the transaction - in a real app, you'd use a testnet or local network
      // For demo purposes, we'll simulate different scenarios
      setTimeout(() => {
        const isSuccess = Math.random() > 0.3; // 70% success rate for demo

        if (isSuccess) {
          setSimulationResults((prev) => ({
            ...prev,
            [proposal.id]: {
              success: true,
              result: {
                gas: BigInt(150000),
                request: {
                  gas: BigInt(150000),
                  to: DAO_ACTION_EXECUTOR_ADDRESS,
                  data: '0x', // Placeholder for actual calldata
                },
              },
            },
          }));
        } else {
          setSimulationResults((prev) => ({
            ...prev,
            [proposal.id]: {
              error: 'Simulation failed: Insufficient funds or contract error',
              details: { gas: BigInt(150000) },
            },
          }));
        }
      }, 1500);
    } catch (error: any) {
      setSimulationResults((prev) => ({
        ...prev,
        [proposal.id]: {
          error: error.message || 'Simulation failed',
          details: error,
        },
      }));
    }
  };

  const handleExecute = async (proposal: Proposal) => {
    if (!proposal.target || !proposal.calldata) {
      setExecutionStatus((prev) => ({
        ...prev,
        [proposal.id]: 'error',
      }));
      return;
    }

    if (!address) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      setExecutionStatus((prev) => ({
        ...prev,
        [proposal.id]: 'loading',
      }));

      // Execute the contract call
      await writeContract({
        address: DAO_ACTION_EXECUTOR_ADDRESS as `0x${string}`,
        abi: DAOActionExecutorABI.abi,
        functionName: 'execute',
        args: [
          proposal.target as `0x${string}`,
          BigInt(proposal.value || '0'),
          proposal.calldata as `0x${string}`,
        ],
        chain: undefined,
        account: address,
      });

      // Log execution to Hedera
      const topicId = process.env.HEDERA_TOPIC_ID;
      if (topicId) {
        await logToHedera(
          `Executed proposal: id=${proposal.id}, target=${proposal.target}, value=${proposal.value}, calldata=${proposal.calldata}, by=${address}`,
          topicId
        );
        console.log('Logged execution to Hedera.');
      } else {
        console.warn('HEDERA_TOPIC_ID not set. Skipping Hedera logging.');
      }

      // Update proposal status to executed
      const approvedProposal = approvedProposals.find(
        (p) => p.id === proposal.id
      );
      if (approvedProposal) {
        updateProposal(proposal.id, { status: 'executed' });
      } else {
        setSampleProposals((prev) =>
          prev.map((p) =>
            p.id === proposal.id ? { ...p, status: 'executed' as const } : p
          )
        );
      }

      setExecutionStatus((prev) => ({
        ...prev,
        [proposal.id]: 'success',
      }));
    } catch (error: any) {
      setExecutionStatus((prev) => ({
        ...prev,
        [proposal.id]: 'error',
      }));
      console.error('Execution failed:', error);
      alert(`Execution failed: ${error.message || 'Unknown error'}`);
    }
  };

  const handleCrosschainExecute = async (proposal: Proposal) => {
    if (!address) {
      alert('Please connect your wallet first');
      return;
    }
    try {
      setExecutionStatus((prev) => ({
        ...prev,
        [proposal.id]: 'loading',
      }));
      // Simulate crosschain execution (replace with real logic as needed)
      setTimeout(() => {
        const isSuccess = Math.random() > 0.2; // 80% success rate for demo
        if (isSuccess) {
          setExecutionStatus((prev) => ({
            ...prev,
            [proposal.id]: 'success',
          }));
          alert('Crosschain execution initiated successfully!');
        } else {
          setExecutionStatus((prev) => ({
            ...prev,
            [proposal.id]: 'error',
          }));
          alert('Crosschain execution failed. Please try again.');
        }
      }, 2000);
    } catch (error: any) {
      setExecutionStatus((prev) => ({
        ...prev,
        [proposal.id]: 'error',
      }));
      console.error('Crosschain execution failed:', error);
      alert(`Crosschain execution failed: ${error.message || 'Unknown error'}`);
    }
  };

  const handleLogout = async () => {
    try {
      await handleLogOut();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">DAO Dashboard</h1>
          <p className="text-muted-foreground">
            Manage proposals and governance
          </p>
          {address && (
            <p className="text-xs text-muted-foreground mt-1">
              Connected: {address.slice(0, 6)}...{address.slice(-4)}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowCreateForm(!showCreateForm)}>
            {showCreateForm ? 'Cancel' : 'Create Proposal'}
          </Button>
          <Button variant="outline" onClick={handleLogout}>
            Sign Out
          </Button>
        </div>
      </div>

      {/* Create Proposal Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Proposal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Proposal Title</Label>
              <Input
                id="title"
                value={newProposal.title}
                onChange={(e) =>
                  setNewProposal({ ...newProposal, title: e.target.value })
                }
                placeholder="Enter proposal title"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={newProposal.description}
                onChange={(e) =>
                  setNewProposal({
                    ...newProposal,
                    description: e.target.value,
                  })
                }
                placeholder="Describe your proposal"
                className="w-full min-h-[100px] p-3 border rounded-md resize-none"
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={newProposal.endDate}
                onChange={(e) =>
                  setNewProposal({ ...newProposal, endDate: e.target.value })
                }
              />
            </div>
            <Button onClick={handleCreateProposal} className="w-full">
              Submit Proposal
            </Button>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Proposals List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Active Proposals</h2>

        {/* Approved Proposals Section */}
        {approvedProposals.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-green-600 mb-3">
              ✅ Approved AI Proposals ({approvedProposals.length})
            </h3>
            {approvedProposals.map((proposal) => (
              <Card
                key={proposal.id}
                className="border-green-200 bg-green-50/50"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {proposal.title}
                        <Badge variant={getStatusColor(proposal.status)}>
                          {proposal.status.toUpperCase()}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="bg-green-100 text-green-800"
                        >
                          AI APPROVED
                        </Badge>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Created by {proposal.creator} • Ends {proposal.endDate}
                      </p>
                      {proposal.confidence && (
                        <p className="text-xs text-green-600 mt-1">
                          AI Confidence: {Math.round(proposal.confidence * 100)}
                          %
                        </p>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    {proposal.description}
                  </p>

                  {proposal.reason && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-md">
                      <strong className="text-sm">AI Rationale:</strong>
                      <p className="text-sm text-muted-foreground mt-1">
                        {proposal.reason}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <div className="flex gap-4 text-sm">
                      <span>👍 {proposal.votesFor} votes</span>
                      <span>👎 {proposal.votesAgainst} votes</span>
                    </div>

                    {/* Show action buttons for pending or passed proposals with a target */}
                    {(proposal.status === 'pending' ||
                      proposal.status === 'passed') &&
                      proposal.target && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSimulate(proposal)}
                            disabled={simulationResults[proposal.id]?.loading}
                          >
                            {simulationResults[proposal.id]?.loading
                              ? 'Simulating...'
                              : 'Simulate'}
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleExecute(proposal)}
                            disabled={
                              executionStatus[proposal.id] === 'loading' ||
                              isExecuting
                            }
                          >
                            {executionStatus[proposal.id] === 'loading' ||
                            isExecuting
                              ? 'Executing...'
                              : 'Execute'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCrosschainExecute(proposal)}
                            disabled={
                              executionStatus[proposal.id] === 'loading' ||
                              isExecuting
                            }
                          >
                            {executionStatus[proposal.id] === 'loading' ||
                            isExecuting
                              ? 'Executing...'
                              : 'Crosschain Execute'}
                          </Button>
                        </div>
                      )}

                    {proposal.status === 'executed' && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-green-600 font-semibold">
                          ✅ Executed
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Simulation Results */}
                  {simulationResults[proposal.id] && (
                    <div className="mt-4 p-3 bg-muted rounded-md">
                      <h4 className="font-semibold mb-2">
                        Simulation Results:
                      </h4>
                      {simulationResults[proposal.id].loading && (
                        <p className="text-sm">Simulating transaction...</p>
                      )}
                      {simulationResults[proposal.id].error && (
                        <div className="text-sm text-red-600">
                          <p className="font-semibold">Error:</p>
                          <p>{simulationResults[proposal.id].error}</p>
                        </div>
                      )}
                      {simulationResults[proposal.id].success && (
                        <div className="text-sm text-green-600">
                          <p className="font-semibold">Success:</p>
                          <p>Transaction would succeed</p>
                          {simulationResults[proposal.id].result && (
                            <p className="text-xs mt-1">
                              Gas:{' '}
                              {simulationResults[
                                proposal.id
                              ].result.request?.gas?.toString() || 'N/A'}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Execution Status */}
                  {executionStatus[proposal.id] && (
                    <div className="mt-2">
                      {executionStatus[proposal.id] === 'success' && (
                        <p className="text-sm text-green-600 font-semibold">
                          ✅ Proposal executed successfully!
                        </p>
                      )}
                      {executionStatus[proposal.id] === 'error' && (
                        <p className="text-sm text-red-600 font-semibold">
                          ❌ Execution failed. Please try again.
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Sample Proposals Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-600 mb-3">
            Sample Proposals ({sampleProposals.length})
          </h3>
          {sampleProposals.map((proposal) => (
            <Card key={proposal.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {proposal.title}
                      <Badge variant={getStatusColor(proposal.status)}>
                        {proposal.status.toUpperCase()}
                      </Badge>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Created by {proposal.creator} • Ends {proposal.endDate}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  {proposal.description}
                </p>

                <div className="flex justify-between items-center">
                  <div className="flex gap-4 text-sm">
                    <span>👍 {proposal.votesFor} votes</span>
                    <span>👎 {proposal.votesAgainst} votes</span>
                  </div>

                  {proposal.status === 'active' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleVote(proposal.id, 'for')}
                      >
                        Vote For
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleVote(proposal.id, 'against')}
                      >
                        Vote Against
                      </Button>
                    </div>
                  )}

                  {proposal.status === 'passed' && proposal.target && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSimulate(proposal)}
                        disabled={simulationResults[proposal.id]?.loading}
                      >
                        {simulationResults[proposal.id]?.loading
                          ? 'Simulating...'
                          : 'Simulate'}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleExecute(proposal)}
                        disabled={
                          executionStatus[proposal.id] === 'loading' ||
                          isExecuting
                        }
                      >
                        {executionStatus[proposal.id] === 'loading' ||
                        isExecuting
                          ? 'Executing...'
                          : 'Execute'}
                      </Button>
                    </div>
                  )}

                  {proposal.status === 'executed' && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-green-600 font-semibold">
                        ✅ Executed
                      </span>
                    </div>
                  )}
                </div>

                {/* Simulation Results */}
                {simulationResults[proposal.id] && (
                  <div className="mt-4 p-3 bg-muted rounded-md">
                    <h4 className="font-semibold mb-2">Simulation Results:</h4>
                    {simulationResults[proposal.id].loading && (
                      <p className="text-sm">Simulating transaction...</p>
                    )}
                    {simulationResults[proposal.id].error && (
                      <div className="text-sm text-red-600">
                        <p className="font-semibold">Error:</p>
                        <p>{simulationResults[proposal.id].error}</p>
                      </div>
                    )}
                    {simulationResults[proposal.id].success && (
                      <div className="text-sm text-green-600">
                        <p className="font-semibold">Success:</p>
                        <p>Transaction would succeed</p>
                        {simulationResults[proposal.id].result && (
                          <p className="text-xs mt-1">
                            Gas:{' '}
                            {simulationResults[
                              proposal.id
                            ].result.request?.gas?.toString() || 'N/A'}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Execution Status */}
                {executionStatus[proposal.id] && (
                  <div className="mt-2">
                    {executionStatus[proposal.id] === 'success' && (
                      <p className="text-sm text-green-600 font-semibold">
                        ✅ Proposal executed successfully!
                      </p>
                    )}
                    {executionStatus[proposal.id] === 'error' && (
                      <p className="text-sm text-red-600 font-semibold">
                        ❌ Execution failed. Please try again.
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
