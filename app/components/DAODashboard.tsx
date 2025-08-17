'use client';

import { useState } from 'react';
import { useAccount, useWriteContract } from 'wagmi';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

  const _getStatusColor = (status: string) => {
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">
            DAO Dashboard
          </h1>
          <p className="text-white/80 text-base md:text-lg">
            Manage proposals and governance
          </p>
          {address && (
            <p className="text-white/60 text-sm mt-2">
              Connected: {address.slice(0, 6)}...{address.slice(-4)}
            </p>
          )}
        </div>
      </div>

      {/* Proposals List */}
      <div className="space-y-6">
        <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white">
          Active Proposals
        </h2>

        {/* Approved Proposals Section */}
        {approvedProposals.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-green-400 mb-4">
              ✅ Approved AI Proposals ({approvedProposals.length})
            </h3>
            {approvedProposals.map((proposal) => (
              <div
                key={proposal.id}
                className="border border-purple-500/30 bg-gradient-to-br from-purple-900/40 to-indigo-900/40 backdrop-blur-md rounded-2xl p-6 mb-6 shadow-xl shadow-purple-500/10"
              >
                <div className="mb-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-white mb-3 flex items-center gap-3">
                        {proposal.title}
                        <Badge
                          className={`${
                            proposal.status === 'active'
                              ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                              : proposal.status === 'passed'
                                ? 'bg-green-500/20 text-green-300 border-green-500/30'
                                : proposal.status === 'failed'
                                  ? 'bg-red-500/20 text-red-300 border-red-500/30'
                                  : proposal.status === 'pending'
                                    ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                                    : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                          } border rounded-full px-3 py-1 text-xs font-medium`}
                        >
                          {proposal.status.toUpperCase()}
                        </Badge>
                        <Badge className="bg-green-500/20 text-green-300 border-green-500/30 border rounded-full px-3 py-1 text-xs font-medium">
                          AI APPROVED
                        </Badge>
                      </h3>
                      <p className="text-white/70 text-sm md:text-base">
                        Created by {proposal.creator} • Ends {proposal.endDate}
                      </p>
                      {proposal.confidence && (
                        <p className="text-green-400 text-sm mt-2">
                          AI Confidence: {Math.round(proposal.confidence * 100)}
                          %
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <p className="text-white/90 text-sm md:text-base leading-relaxed">
                    {proposal.description}
                  </p>

                  {proposal.reason && (
                    <div className="mb-6 p-4 border border-blue-500/20 rounded-xl bg-blue-500/10">
                      <strong className="text-blue-300 text-sm md:text-base">
                        AI Rationale:
                      </strong>
                      <p className="text-blue-200 text-sm md:text-base mt-2 leading-relaxed">
                        {proposal.reason}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    {/* Show action buttons for pending or passed proposals with a target */}
                    {(proposal.status === 'pending' ||
                      proposal.status === 'passed') &&
                      proposal.target && (
                        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSimulate(proposal)}
                            disabled={simulationResults[proposal.id]?.loading}
                            className="bg-purple-900/30 border-purple-500/30 hover:bg-purple-800/40 text-white rounded-xl px-4 py-2"
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
                            className="bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white border-0 hover:from-indigo-600 hover:to-fuchsia-600 rounded-xl px-4 py-2"
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
                            className="bg-purple-900/30 border-purple-500/30 hover:bg-purple-800/40 text-white rounded-xl px-4 py-2"
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
                        <span className="text-green-400 font-semibold text-sm md:text-base">
                          ✅ Executed
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Simulation Results */}
                  {simulationResults[proposal.id] && (
                    <div className="mt-6 p-4 border border-purple-500/30 rounded-xl bg-gradient-to-r from-purple-900/30 to-indigo-900/30">
                      <h4 className="font-semibold mb-3 text-white text-lg">
                        Simulation Results:
                      </h4>
                      {simulationResults[proposal.id].loading && (
                        <p className="text-white/80 text-sm md:text-base">
                          Simulating transaction...
                        </p>
                      )}
                      {simulationResults[proposal.id].error && (
                        <div className="text-red-300 text-sm md:text-base">
                          <p className="font-semibold">Error:</p>
                          <p>{simulationResults[proposal.id].error}</p>
                        </div>
                      )}
                      {simulationResults[proposal.id].success && (
                        <div className="text-green-300 text-sm md:text-base">
                          <p className="font-semibold">Success:</p>
                          <p>Transaction would succeed</p>
                          {simulationResults[proposal.id].result && (
                            <p className="text-xs mt-2 text-white/70">
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
                    <div className="mt-4">
                      {executionStatus[proposal.id] === 'success' && (
                        <p className="text-green-400 font-semibold text-sm md:text-base">
                          ✅ Proposal executed successfully!
                        </p>
                      )}
                      {executionStatus[proposal.id] === 'error' && (
                        <p className="text-red-400 font-semibold text-sm md:text-base">
                          ❌ Execution failed. Please try again.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
