'use client';

import { EthereumWalletConnectors } from '@dynamic-labs/ethereum';
import { DynamicContextProvider } from '@dynamic-labs/sdk-react-core';
import { DynamicWagmiConnector } from '@dynamic-labs/wagmi-connector';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type React from 'react';
import { createContext, type ReactNode, useContext, useState } from 'react';
import { WagmiProvider } from 'wagmi';
import { config } from '@/lib/wagmi';

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
  sourceChain?: string;
  targetChain?: string;
  targetContract?: string;
  functionName?: string;
  payable?: boolean;
  arguments?: string[]; // Changed from any[] to string[]
  valueInETH?: number;
  support?: boolean;
  confidence?: number;
  reason?: string;
}

interface ProposalContextType {
  approvedProposals: Proposal[];
  addApprovedProposal: (proposal: Proposal) => void;
  removeProposal: (id: string) => void;
  updateProposal: (id: string, updates: Partial<Proposal>) => void;
}

const ProposalContext = createContext<ProposalContextType | undefined>(
  undefined
);

export function ProposalProvider({ children }: { children: ReactNode }) {
  const [approvedProposals, setApprovedProposals] = useState<Proposal[]>([]);

  const addApprovedProposal = (proposal: Proposal) => {
    const newProposal: Proposal = {
      ...proposal,
      id: Date.now().toString(),
      status: 'pending',
      votesFor: 0,
      votesAgainst: 0,
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0], // 7 days from now
      creator: 'AI Generated',
    };
    setApprovedProposals((prev) => [newProposal, ...prev]);
  };

  const removeProposal = (id: string) => {
    setApprovedProposals((prev) => prev.filter((p) => p.id !== id));
  };

  const updateProposal = (id: string, updates: Partial<Proposal>) => {
    setApprovedProposals((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  return (
    <ProposalContext.Provider
      value={{
        approvedProposals,
        addApprovedProposal,
        removeProposal,
        updateProposal,
      }}
    >
      {children}
    </ProposalContext.Provider>
  );
}

export function useProposals() {
  const context = useContext(ProposalContext);
  if (context === undefined) {
    throw new Error('useProposals must be used within a ProposalProvider');
  }
  return context;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient();

  return (
    <DynamicContextProvider
      theme="auto"
      settings={{
        environmentId:
          process.env.NEXT_PUBLIC_DYNAMIC_ENV_ID ||
          '2762a57b-faa4-41ce-9f16-abff9300e2c9',
        walletConnectors: [EthereumWalletConnectors],
      }}
    >
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <DynamicWagmiConnector>
            <ProposalProvider>{children}</ProposalProvider>
          </DynamicWagmiConnector>
        </QueryClientProvider>
      </WagmiProvider>
    </DynamicContextProvider>
  );
}
