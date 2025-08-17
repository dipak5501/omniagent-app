'use client';

import { useIsLoggedIn } from '@dynamic-labs/sdk-react-core';
import { AnimatePresence, motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AuthLoadingOverlay from '@/app/components/AuthLoadingOverlay';
import DashboardLoadingOverlay from '@/app/components/DashboardLoadingOverlay';
import { Button } from '@/components/ui/button';

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
  const [isDashboardLoading, setIsDashboardLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<DashboardTab>('omniagent');

  useEffect(() => {
    // Check if user is logged in
    if (!isLoggedIn) {
      // Redirect to home page if not logged in
      router.push('/');
    } else {
      setIsLoading(false);
      // Simulate dashboard loading time
      setTimeout(() => {
        setIsDashboardLoading(false);
      }, 1500);
    }
  }, [isLoggedIn, router]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen overflow-hidden relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <AuthLoadingOverlay isVisible={true} />
      </div>
    );
  }

  // Show dashboard loading when components are loading
  if (isDashboardLoading) {
    return (
      <div className="min-h-screen overflow-hidden relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <DashboardLoadingOverlay isVisible={true} />
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

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  return (
    <div
      className="relative min-h-dvh w-full overflow-hidden"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      <style jsx global>{`
        ::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* Background - keeping our existing theme */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 z-10"></div>
      <div
        className="absolute inset-0 opacity-10 z-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Header */}
      <header className="w-full flex items-center justify-between px-6 py-4 relative z-20">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-md bg-gradient-to-br from-fuchsia-500/70 via-indigo-500/70 to-cyan-400/70 ring-1 ring-white/20" />
          <div className="flex flex-col">
            <span className="text-white font-semibold text-lg md:text-xl lg:text-2xl">
              OmniAgent DAO
            </span>
            <span className="text-white/60 text-sm md:text-base">
              Manage your DAO and AI agent
            </span>
          </div>
        </div>
        <UserProfile />
      </header>

      <main className="mx-auto w-full max-w-7xl space-y-6 px-6 pb-24 relative z-20">
        {/* Tab Navigation with Separate Buttons */}
        <div className="flex gap-3 mb-8 justify-center relative">
          <Button
            variant={activeTab === 'omniagent' ? 'default' : 'outline'}
            onClick={() => setActiveTab('omniagent')}
            className={`px-6 py-3 text-base md:text-lg font-medium rounded-xl transition-all duration-300 ${
              activeTab === 'omniagent'
                ? 'bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white border-0 hover:from-indigo-600 hover:to-fuchsia-600 shadow-lg'
                : 'bg-white/10 border-white/10 hover:bg-white/20 text-white'
            }`}
          >
            OmniAgent
          </Button>
          <Button
            variant={activeTab === 'dao' ? 'default' : 'outline'}
            onClick={() => setActiveTab('dao')}
            className={`px-6 py-3 text-base md:text-lg font-medium rounded-xl transition-all duration-300 ${
              activeTab === 'dao'
                ? 'bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white border-0 hover:from-indigo-600 hover:to-fuchsia-600 shadow-lg'
                : 'bg-white/10 border-white/10 hover:bg-white/20 text-white'
            }`}
          >
            DAO Dashboard
          </Button>
        </div>

        {/* Tab Content with Slide Animation */}
        <div className="relative z-20 overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeTab}
              custom={activeTab === 'dao' ? -1 : 1}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              className="w-full"
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Status Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30">
        <div className="mx-3 mb-3 flex items-center justify-between rounded-lg border border-white/10 bg-black/30 px-3 py-2 backdrop-blur">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-green-400/90">
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                role="img"
                aria-label="Network Status"
              >
                <title>Network Active</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
                />
              </svg>
              <span className="text-sm">Network Active</span>
            </div>
            <div className="flex items-center gap-2 text-sky-300/90">
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                role="img"
                aria-label="Security Status"
              >
                <title>Quantum Secure</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              <span className="text-sm">Quantum Secure</span>
            </div>
            <div className="flex items-center gap-2 text-violet-300/90">
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                role="img"
                aria-label="AI Status"
              >
                <title>AI Ready</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <span className="text-sm">AI Ready</span>
            </div>
          </div>
          <div className="text-white/70 text-sm">
            OmniAgent v3.0 • Neural Interface
          </div>
        </div>
      </div>
    </div>
  );
}
