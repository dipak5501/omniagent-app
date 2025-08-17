'use client';

import { useIsLoggedIn } from '@dynamic-labs/sdk-react-core';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// Dynamic imports to prevent SSR issues
const DAODashboard = dynamic(() => import('@/app/components/DAODashboard'), {
  ssr: false,
});
const OmniAgentDashboard = dynamic(
  () => import('@/app/components/OmniAgentDashboard'),
  {
    ssr: false,
  }
);
const UserProfile = dynamic(() => import('@/app/components/UserProfile'), {
  ssr: false,
});

type DashboardTab = 'omniagent' | 'dao';

export default function DashboardPage() {
  const isLoggedIn = useIsLoggedIn();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<DashboardTab>('omniagent');

  useEffect(() => {
    // Check if user is logged in
    if (!isLoggedIn) {
      // Redirect to home page if not logged in
      router.push('/');
    } else {
      setIsLoading(false);
    }
  }, [isLoggedIn, router]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <Card className="p-8">
          <CardContent className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Checking authentication...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show dashboard only if logged in
  if (!isLoggedIn) {
    return null; // Will redirect to home
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'omniagent':
        return <OmniAgentDashboard />;
      case 'dao':
        return <DAODashboard />;
      default:
        return <OmniAgentDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header with User Profile */}
      <Card className="border-b rounded-none border-x-0 border-t-0 shadow-none">
        <CardContent className="p-4 sm:p-6">
          <div
            className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8"
            style={{ gap: 'clamp(1rem, 45vw, 700px)' }}
          >
            <div className="text-center sm:text-left">
              <h1 className="text-xl sm:text-2xl font-bold">OmniAgent DAO</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Manage your DAO and AI agent
              </p>
            </div>
            <UserProfile />
          </div>
        </CardContent>
      </Card>

      <div className="p-6">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 justify-center">
          <Button
            variant={activeTab === 'omniagent' ? 'default' : 'outline'}
            onClick={() => setActiveTab('omniagent')}
          >
            OmniAgent
          </Button>
          <Button
            variant={activeTab === 'dao' ? 'default' : 'outline'}
            onClick={() => setActiveTab('dao')}
          >
            DAO Dashboard
          </Button>
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </div>
  );
}
