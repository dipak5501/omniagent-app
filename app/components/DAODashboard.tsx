'use client';

import { useState } from 'react';
import { useAccount, useWriteContract } from 'wagmi';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  const { address } = useAccount();
  const { approvedProposals, updateProposal } = useProposals();

  const [simulationResults, setSimulationResults] = useState<{
    [key: string]: {
      loading?: boolean;
      error?: string;
      success?: boolean;
      result?: unknown;
    };
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
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Simulation failed';
      setSimulationResults((prev) => ({
        ...prev,
        [proposal.id]: {
          error: errorMessage,
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
      }

      setExecutionStatus((prev) => ({
        ...prev,
        [proposal.id]: 'success',
      }));
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      setExecutionStatus((prev) => ({
        ...prev,
        [proposal.id]: 'error',
      }));
      console.error('Execution failed:', error);
      alert(`Execution failed: ${errorMessage}`);
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
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      setExecutionStatus((prev) => ({
        ...prev,
        [proposal.id]: 'error',
      }));
      console.error('Crosschain execution failed:', error);
      alert(`Crosschain execution failed: ${errorMessage}`);
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
      </div>

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
                              {(
                                simulationResults[proposal.id].result as {
                                  request?: { gas?: number };
                                }
                              )?.request?.gas?.toString() || 'N/A'}
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
      </div>
    </div>
  );
}
