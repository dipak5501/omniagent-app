'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

interface Proposal {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'passed' | 'failed' | 'pending';
  votesFor: number;
  votesAgainst: number;
  endDate: string;
  creator: string;
}

export default function DAODashboard() {
  const [proposals, setProposals] = useState<Proposal[]>([
    {
      id: '1',
      title: 'Add New Token to Treasury',
      description:
        'Proposal to add USDC token to the DAO treasury for better liquidity management.',
      status: 'active',
      votesFor: 1250,
      votesAgainst: 320,
      endDate: '2024-01-15',
      creator: '0x1234...5678',
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
    },
  ]);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProposal, setNewProposal] = useState({
    title: '',
    description: '',
    endDate: '',
  });

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
      setProposals([proposal, ...proposals]);
      setNewProposal({ title: '', description: '', endDate: '' });
      setShowCreateForm(false);
    }
  };

  const handleVote = (proposalId: string, vote: 'for' | 'against') => {
    setProposals(
      proposals.map((proposal) =>
        proposal.id === proposalId
          ? {
              ...proposal,
              votesFor:
                vote === 'for' ? proposal.votesFor + 1 : proposal.votesFor,
              votesAgainst:
                vote === 'against'
                  ? proposal.votesAgainst + 1
                  : proposal.votesAgainst,
            }
          : proposal
      )
    );
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">DAO Dashboard</h1>
          <p className="text-muted-foreground">
            Manage proposals and governance
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowCreateForm(!showCreateForm)}>
            {showCreateForm ? 'Cancel' : 'Create Proposal'}
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
        {proposals.map((proposal) => (
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
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleVote(proposal.id, 'for')}
                    disabled={proposal.status !== 'active'}
                  >
                    Vote For
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleVote(proposal.id, 'against')}
                    disabled={proposal.status !== 'active'}
                  >
                    Vote Against
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
