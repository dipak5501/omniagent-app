'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useState } from 'react';

export default function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [proposals, setProposals] = useState([
    {
      id: '1',
      description: 'Stake 50 ETH in Lido',
      target: '0xabc123...',
      status: 'pending',
    },
    {
      id: '2',
      description: 'Swap 1000 USDC to DAI',
      target: '0xdef456...',
      status: 'executed',
    },
  ]);

  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold">📊 OmniAgent Dashboard</h1>

      {/* Treasury Card */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-2">Treasury</h2>
          <div className="flex space-x-4">
            <div className="text-gray-700">ETH: 100</div>
            <div className="text-gray-700">USDC: 25,000</div>
          </div>
        </CardContent>
      </Card>

      {/* Proposals Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Proposals</h2>
          <Button
            disabled={loading}
            onClick={async () => {
              setLoading(true);
              try {
                const res = await fetch('/api/agent', { method: 'POST' });
                const data = await res.json();
                setProposals((prev) => [...prev, ...data]);
              } catch (err) {
                console.error('Failed to fetch proposals:', err);
              } finally {
                setLoading(false);
              }
            }}
          >
            {loading ? 'Generating...' : 'Generate Proposal'}
          </Button>
        </div>

        <div className="space-y-4">
          {proposals.map((p) => (
            <Card key={p.id}>
              <CardContent className="p-4">
                <div className="text-lg font-medium">{p.description}</div>
                <div className="text-sm text-gray-500">Target: {p.target}</div>
                <div className="text-sm mt-2">
                  Status:{' '}
                  <span
                    className={`font-semibold ${
                      p.status === 'executed'
                        ? 'text-green-600'
                        : p.status === 'pending'
                          ? 'text-yellow-600'
                          : 'text-red-600'
                    }`}
                  >
                    {p.status}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
