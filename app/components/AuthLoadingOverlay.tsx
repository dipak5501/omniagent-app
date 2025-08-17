'use client';

import { Activity, CheckCircle, Lock, Shield, Wallet } from 'lucide-react';
import { motion as Motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

function useProgress() {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setValue((v) => {
        if (v >= 99) {
          return 25; // loop subtly so it looks alive
        }
        // accelerate at the start, slow near the end
        const delta = v < 40 ? 3 : v < 70 ? 2 : 0.8;
        return Math.min(100, v + delta);
      });
    }, 80);
    return () => clearInterval(id);
  }, []);
  return Math.round(value);
}

const authTasks = [
  { id: 'init', label: 'Initializing secure connection', icon: Shield },
  { id: 'wallet', label: 'Verifying wallet connection', icon: Wallet },
  { id: 'auth', label: 'Authenticating user session', icon: Lock },
  { id: 'validate', label: 'Validating permissions', icon: CheckCircle },
  { id: 'sync', label: 'Syncing user data', icon: Activity },
];

interface AuthLoadingOverlayProps {
  isVisible: boolean;
}

export default function AuthLoadingOverlay({
  isVisible,
}: AuthLoadingOverlayProps) {
  const progress = useProgress();
  const activeIndex = useMemo(
    () =>
      Math.min(
        authTasks.length - 1,
        Math.floor((progress / 100) * authTasks.length)
      ),
    [progress]
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isVisible || !mounted) {
    return null;
  }

  // Use portal to render at document body level
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md isolate">
      <div className="relative w-full max-w-2xl mx-auto px-6">
        {/* Security Shield motif */}
        <div className="relative mb-8 grid place-items-center">
          {/* Rotating outer ring */}
          <Motion.div
            aria-hidden
            className="relative h-32 w-32 rounded-full border border-white/10 bg-white/5"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
          >
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  'conic-gradient(from 0deg, rgba(59,130,246,.25), transparent 40%, rgba(16,185,129,.25), transparent 75%, rgba(168,85,247,.25))',
                maskImage:
                  'radial-gradient(closest-side, transparent 54%, black 55%)',
                WebkitMaskImage:
                  'radial-gradient(closest-side, transparent 54%, black 55%)',
              }}
            />
            {/* Small orbiting dots */}
            {[0, 1, 2].map((i) => (
              <Motion.span
                key={i}
                className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-300 shadow-[0_0_16px_rgba(59,130,246,0.8)]"
                style={{ transformOrigin: '0 -60px' }}
                animate={{ rotate: 360 }}
                transition={{
                  repeat: Infinity,
                  duration: 8 + i * 4,
                  ease: 'linear',
                }}
              />
            ))}
          </Motion.div>

          {/* Security Shield core */}
          <div className="absolute h-20 w-20 rounded-2xl border border-white/15 bg-gradient-to-b from-white/15 to-white/5 backdrop-blur">
            {/* Shield icon */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <Shield className="h-10 w-10 text-blue-300" />
            </div>
            {/* Scanning effect */}
            <Motion.div
              className="absolute left-1/2 top-[52px] h-1 w-12 -translate-x-1/2 rounded bg-gradient-to-r from-blue-400 via-emerald-300 to-purple-300"
              animate={{ width: [24, 48, 32, 56, 40] }}
              transition={{ duration: 3.2, repeat: Infinity }}
            />
          </div>
        </div>

        <div className="mb-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/10 px-4 py-2">
            <span className="text-white/90 text-sm font-medium">
              Checking Authentication
            </span>
          </div>
        </div>
        <p className="max-w-xl text-center text-white/80 text-sm mb-6">
          Verifying your wallet connection and securing your session. Please
          wait while we authenticate your identity.
        </p>

        {/* Progress */}
        <div className="mb-6">
          <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
            <Motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-white/80 text-sm">
            <span>{progress}%</span>
            <span>Securing connection...</span>
          </div>
        </div>

        {/* Rolling task list */}
        <ul className="grid w-full grid-cols-1 gap-2 md:grid-cols-2">
          {authTasks.map((t, idx) => {
            const Icon = t.icon;
            const active = idx === activeIndex;
            return (
              <li
                key={t.id}
                className={`flex items-center gap-3 rounded-md border border-white/10 px-3 py-2 ${active ? 'bg-white/10' : 'bg-white/5'}`}
              >
                <Icon
                  className={`h-4 w-4 ${active ? 'text-blue-300' : 'text-white/70'}`}
                />
                <span
                  className={`text-sm ${active ? 'text-white' : 'text-white/80'}`}
                >
                  {t.label}
                </span>
                {active && <span className="ml-auto text-blue-300">•</span>}
              </li>
            );
          })}
        </ul>

        {/* Security pattern (ambient) */}
        <div className="pointer-events-none mt-6 grid w-full grid-cols-8 gap-2 opacity-30">
          {Array.from({ length: 8 }, (_, col) => {
            const colId = `security-col-${col}`;
            return (
              <div
                key={colId}
                className="relative h-16 overflow-hidden rounded bg-white/5"
              >
                {Array.from({ length: 12 }, (__, row) => {
                  const rowId = `${colId}-row-${row}`;
                  return (
                    <Motion.span
                      key={rowId}
                      className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-400/60 to-transparent"
                      initial={{ y: -8 }}
                      animate={{ y: [-8, 80] }}
                      transition={{
                        duration: 1.8 + (row % 5) * 0.4,
                        repeat: Infinity,
                        delay: (row % 7) * 0.12,
                      }}
                      style={{ top: `${row * 8}px` }}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>,
    document.body
  );
}
