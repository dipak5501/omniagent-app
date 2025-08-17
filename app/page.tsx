'use client';

import {
  useDynamicContext,
  useIsLoggedIn,
  useUserWallets,
} from '@dynamic-labs/sdk-react-core';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AuthLoadingOverlay from '@/app/components/AuthLoadingOverlay';
import { LiveActivityFeed } from '@/app/components/LiveActivityFeed';
import { FuturisticLoginForm } from '@/app/components/login/FuturisticLoginForm';
import TypingEffect from '@/app/components/TypingEffect';
import UserProfile from '@/app/components/UserProfile';
import WelcomeLoadingOverlay from '@/app/components/WelcomeLoadingOverlay';
import { Button } from '@/components/ui/button';
import { useDarkMode } from '@/lib/useDarkMode';

export default function Main() {
  const { isDarkMode: _ } = useDarkMode();
  const [isMounted, setIsMounted] = useState(false);
  const isLoggedIn = useIsLoggedIn();
  const { user, primaryWallet } = useDynamicContext();
  const _userWallets = useUserWallets();
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="min-h-screen overflow-hidden relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <AuthLoadingOverlay isVisible={true} />
      </div>
    );
  }

  // Show welcome loading when user is logged in but page is still initializing
  if (isLoggedIn && (!user || !primaryWallet)) {
    return (
      <div className="min-h-screen overflow-hidden relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <WelcomeLoadingOverlay isVisible={true} />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen overflow-hidden relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
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

        <motion.div
          className="absolute top-20 left-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl z-10"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl z-10"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* <DataStreams /> */}

        <div className="relative z-20 min-h-screen flex items-center justify-center p-8">
          <motion.div
            className="w-full max-w-2xl"
            initial={{ opacity: 0, y: 50, rotateX: -15 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{
              duration: 1.2,
              ease: 'easeOut',
              delay: 0.3,
            }}
          >
            <FuturisticLoginForm />
          </motion.div>
        </div>

        <motion.div
          className="absolute bottom-6 left-6 right-6 z-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 0.8 }}
        >
          <div className="flex items-center justify-between text-base text-white/50 backdrop-blur-sm bg-white/5 rounded-xl p-5 border border-white/10">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                <span>Network Active</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-400 rounded-full" />
                <span>Quantum Secure</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-400 rounded-full" />
                <span>AI Ready</span>
              </div>
            </div>
            <div className="text-right">
              <p>OmniAgent v3.0 • Neural Interface</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="absolute inset-0 pointer-events-none z-15"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.1, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <motion.div
            className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
            animate={{ y: [-10, window.innerHeight + 10] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          />
        </motion.div>
      </div>
    );
  }

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
            <span className="text-white font-semibold">OmniAgent</span>
            <span className="text-white/60 text-sm">
              AI-Powered DAO Governance
            </span>
          </div>
        </div>

        <UserProfile />
      </header>

      <main className="mx-auto w-full max-w-7xl space-y-6 px-6 pb-24 relative z-20">
        {/* Welcome Card */}
        <div className="relative overflow-hidden border border-white/10 bg-gradient-to-br from-indigo-600/60 via-violet-600/50 to-fuchsia-600/60 p-6 backdrop-blur rounded-2xl max-w-4xl mx-auto">
          <div
            className="pointer-events-none absolute inset-0 -z-10 opacity-60"
            style={{
              backgroundImage: `radial-gradient(1200px 400px at 50% -100px, rgba(168,85,247,0.3), transparent),
                              radial-gradient(800px 300px at 120% 20%, rgba(99,102,241,0.25), transparent),
                              repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 24px)`,
            }}
          />
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="max-w-2xl">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">
                Welcome to OmniAgent
              </h1>
              <div className="text-white text-base md:text-lg lg:text-xl mb-4 flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                Your wallet is connected
              </div>
              <p className="text-white/90 text-sm md:text-base lg:text-lg leading-relaxed mb-4">
                <TypingEffect
                  text="OmniAgent is an AI-powered governance copilot for DAOs. Connect your wallet, set your goals and risk tolerance, and OmniAgent analyzes your multi-chain treasury to surface insights, highlight risks, and generate ready-to-execute proposals complete with confidence scores and safeguards. Simulate every action first, then execute securely across Ethereum, Polygon, Arbitrum, and more from a single unified interface. With OmniAgent, governance moves from weeks of manual work to fast, safe, and data-driven decisions."
                  speed={50}
                  className="text-white/90"
                />
              </p>
              <p className="text-white text-base md:text-lg lg:text-xl">
                Let&apos;s personalize your AI governance assistant and get you
                to your DAO dashboard.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => router.push('/dashboard')}
                className="bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white border-0 hover:from-indigo-600 hover:to-fuchsia-600"
              >
                Go to DAO Dashboard
              </Button>
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="w-full max-w-4xl mx-auto">
          <div className="flex items-center justify-between px-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-white font-medium">
                Live Governance Activity
              </span>
              <span className="text-fuchsia-300">•</span>
            </div>
            <div className="bg-white/10 border border-white/10 rounded-full px-2 py-1 text-xs text-white">
              Realtime
            </div>
          </div>
          <LiveActivityFeed />
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
