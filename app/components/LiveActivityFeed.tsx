'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { CircleDot, Globe, Lock, Shield, Users, Vote } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface ActivityItem {
  id: string;
  type: 'vote' | 'security' | 'member' | 'proposal' | 'block' | 'network';
  title: string;
  time: string;
  status: 'ok' | 'warn' | 'fail';
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

export function LiveActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  const generateActivity = useCallback((): ActivityItem => {
    const types = [
      {
        type: 'proposal' as const,
        icon: CircleDot,
        color: 'text-blue-400',
        values: [
          'New Proposal #47',
          'Treasury Update',
          'Protocol Upgrade',
          'Community Fund',
        ],
        status: 'warn' as const,
      },
      {
        type: 'vote' as const,
        icon: Vote,
        color: 'text-purple-400',
        values: [
          'Vote Cast +1',
          'Quorum Reached',
          'Proposal Passed',
          'Voting Active',
        ],
        status: 'ok' as const,
      },
      {
        type: 'member' as const,
        icon: Users,
        color: 'text-green-400',
        values: [
          'New Member +1',
          'Validator Joined',
          'Delegate Active',
          'Stake Updated',
        ],
        status: 'ok' as const,
      },
      {
        type: 'security' as const,
        icon: Shield,
        color: 'text-orange-400',
        values: [
          'Network Secure',
          'Consensus +99%',
          'Block Verified',
          'Hash Validated',
        ],
        status: 'ok' as const,
      },
      {
        type: 'block' as const,
        icon: Lock,
        color: 'text-cyan-400',
        values: [
          'Block Verified',
          'Transaction Confirmed',
          'Hash Validated',
          'Chain Updated',
        ],
        status: 'ok' as const,
      },
      {
        type: 'network' as const,
        icon: Globe,
        color: 'text-emerald-400',
        values: [
          'Node Online +1',
          'Sync Complete',
          'Peer Connected',
          'Block Height +1',
        ],
        status: 'ok' as const,
      },
    ];

    const type = types[Math.floor(Math.random() * types.length)];
    const value = type.values[Math.floor(Math.random() * type.values.length)];

    return {
      id: Math.random().toString(36).substr(2, 9),
      type: type.type,
      title: value,
      time: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      status: type.status,
      icon: type.icon,
      color: type.color,
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(
      () => {
        setActivities((prev) => {
          const newActivity = generateActivity();
          const updated = [newActivity, ...prev.slice(0, 4)];
          return updated;
        });
      },
      2000 + Math.random() * 3000
    );

    setActivities([
      generateActivity(),
      generateActivity(),
      generateActivity(),
      generateActivity(),
      generateActivity(),
    ]);

    return () => clearInterval(interval);
  }, [generateActivity]);

  return (
    <div className="bg-transparent rounded-xl p-3">
      <div className="h-[420px] overflow-y-auto overflow-x-hidden">
        <AnimatePresence mode="popLayout">
          {activities.map((item, index) => (
            <motion.div
              key={item.id}
              className="rounded-lg bg-gradient-to-br from-white/10 to-transparent p-3 mb-3"
              initial={{ opacity: 0, x: 300, scale: 0.8 }}
              animate={{
                opacity: 1 - index * 0.15,
                x: 0,
                scale: 1 - index * 0.05,
                y: index * 2,
              }}
              exit={{ opacity: 0, x: -300, scale: 0.8 }}
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 25,
                duration: 0.6,
              }}
              style={{ zIndex: 10 - index }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    className={`h-8 w-8 grid place-items-center rounded-md bg-white/10 ${item.color}`}
                    animate={{
                      scale: index === 0 ? [1, 1.1, 1] : 1,
                      rotate: index === 0 ? [0, 5, 0] : 0,
                    }}
                    transition={{ duration: 0.6 }}
                  >
                    <item.icon className="h-4 w-4 text-white/90" />
                  </motion.div>
                  <div className="flex flex-col">
                    <motion.span
                      className="text-white/90 text-sm font-medium"
                      animate={{
                        opacity:
                          index === 0 ? [0.7, 1, 0.9] : 0.8 - index * 0.1,
                      }}
                    >
                      {item.title}
                    </motion.span>
                    <span className="text-white/60 text-xs">{item.time}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {index === 0 && (
                    <motion.div
                      className="w-2 h-2 bg-green-400 rounded-full"
                      animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  )}
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{
                      backgroundColor:
                        item.status === 'ok'
                          ? '#10b981'
                          : item.status === 'warn'
                            ? '#f59e0b'
                            : '#ef4444',
                    }}
                  />
                </div>
              </div>

              {index === 0 && (
                <motion.div
                  className="mt-3 h-1 bg-white/10 rounded-full overflow-hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                >
                  <motion.div
                    className={`h-full rounded-full bg-gradient-to-r ${
                      item.type === 'proposal'
                        ? 'from-blue-400 to-blue-600'
                        : item.type === 'vote'
                          ? 'from-purple-400 to-purple-600'
                          : item.type === 'member'
                            ? 'from-green-400 to-green-600'
                            : item.type === 'security'
                              ? 'from-orange-400 to-orange-600'
                              : item.type === 'block'
                                ? 'from-cyan-400 to-cyan-600'
                                : 'from-emerald-400 to-emerald-600'
                    }`}
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 2, ease: 'easeOut' }}
                  />
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
