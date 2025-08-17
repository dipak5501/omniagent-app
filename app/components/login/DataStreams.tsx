import { AnimatePresence, motion } from 'framer-motion';
import { Globe, Shield, TrendingUp, Users, Vote, Zap } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface DataPoint {
  id: string;
  type: 'proposal' | 'vote' | 'member' | 'security' | 'network';
  value: string;
  timestamp: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

export function DataStreams() {
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);

  const generateDataPoint = useCallback((): DataPoint => {
    const types = [
      {
        type: 'proposal' as const,
        icon: TrendingUp,
        color: 'text-blue-400',
        values: [
          'New Proposal #47',
          'Treasury Update',
          'Protocol Upgrade',
          'Community Fund',
        ],
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
      },
      {
        type: 'security' as const,
        icon: Shield,
        color: 'text-orange-400',
        values: [
          'Block Verified',
          'Consensus +99%',
          'Network Secure',
          'Hash Validated',
        ],
      },
      {
        type: 'network' as const,
        icon: Globe,
        color: 'text-cyan-400',
        values: [
          'Node Online +1',
          'Sync Complete',
          'Peer Connected',
          'Block Height +1',
        ],
      },
    ];

    const type = types[Math.floor(Math.random() * types.length)];
    const value = type.values[Math.floor(Math.random() * type.values.length)];

    return {
      id: Math.random().toString(36).substr(2, 9),
      type: type.type,
      value,
      timestamp: Date.now(),
      icon: type.icon,
      color: type.color,
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(
      () => {
        setDataPoints((prev) => {
          const newPoint = generateDataPoint();
          const updated = [newPoint, ...prev.slice(0, 4)];
          return updated;
        });
      },
      2000 + Math.random() * 3000
    );

    setDataPoints([generateDataPoint(), generateDataPoint()]);

    return () => clearInterval(interval);
  }, [generateDataPoint]);

  return (
    <div className="fixed top-6 right-6 w-96 space-y-3 z-10">
      <motion.div
        className="text-base text-white/60 flex items-center space-x-3 mb-6"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <Zap className="w-5 h-5" />
        <span>Live Governance Activity</span>
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
      </motion.div>

      <AnimatePresence mode="popLayout">
        {dataPoints.map((point, index) => (
          <motion.div
            key={point.id}
            className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-5 shadow-lg"
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{
              opacity: 1 - index * 0.15,
              x: 0,
              scale: 1 - index * 0.05,
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
            <div className="flex items-center space-x-4">
              <motion.div
                className={`p-3 rounded-xl bg-white/10 ${point.color}`}
                animate={{
                  scale: index === 0 ? [1, 1.1, 1] : 1,
                  rotate: index === 0 ? [0, 5, 0] : 0,
                }}
                transition={{ duration: 0.6 }}
              >
                <point.icon className="w-6 h-6" />
              </motion.div>

              <div className="flex-1 min-w-0">
                <motion.p
                  className="text-lg text-white/90 truncate"
                  animate={{
                    opacity: index === 0 ? [0.7, 1, 0.9] : 0.8 - index * 0.1,
                  }}
                >
                  {point.value}
                </motion.p>
                <p className="text-base text-white/50">
                  {new Date(point.timestamp).toLocaleTimeString()}
                </p>
              </div>

              {index === 0 && (
                <motion.div
                  className="w-3 h-3 bg-green-400 rounded-full"
                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
            </div>

            <motion.div
              className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: index === 0 ? 0.5 : 0.2 }}
            >
              <motion.div
                className={`h-full rounded-full bg-gradient-to-r ${
                  point.type === 'proposal'
                    ? 'from-blue-400 to-blue-600'
                    : point.type === 'vote'
                      ? 'from-purple-400 to-purple-600'
                      : point.type === 'member'
                        ? 'from-green-400 to-green-600'
                        : point.type === 'security'
                          ? 'from-orange-400 to-orange-600'
                          : 'from-cyan-400 to-cyan-600'
                }`}
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 2, ease: 'easeOut' }}
              />
            </motion.div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
