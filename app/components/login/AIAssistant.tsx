import { motion } from 'framer-motion';
import { Bot, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

export function AIAssistant() {
  const [isActive, setIsActive] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(0);

  const messages = [
    'Welcome to OmniAgent',
    'Secure DAO Governance',
    'AI-Powered Decisions',
    'Decentralized Future',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % messages.length);
      setIsActive(true);
      setTimeout(() => setIsActive(false), 2000);
    }, 4000);

    return () => clearInterval(interval);
  }, []); // messages is a constant array, no need for dependency

  return (
    <motion.div
      className="flex items-center space-x-4 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <motion.div
        className="relative"
        animate={{ scale: isActive ? 1.1 : 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500 rounded-3xl flex items-center justify-center relative overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: [-50, 50] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <Bot className="w-8 h-8 text-white relative z-10" />

          <motion.div
            className="absolute inset-0 rounded-3xl border-3 border-blue-400/50"
            animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div
            className="absolute inset-0 rounded-3xl border-3 border-purple-400/50"
            animate={{ scale: [1, 1.3], opacity: [0.7, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          />
        </div>

        <motion.div
          className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center"
          animate={{ scale: isActive ? [1, 1.3, 1] : 1 }}
          transition={{ duration: 0.6, repeat: isActive ? Infinity : 0 }}
        >
          <Zap className="w-3 h-3 text-green-800" />
        </motion.div>
      </motion.div>

      <div className="flex flex-col">
        <motion.h3
          className="text-2xl font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
          animate={{ opacity: isActive ? [0.7, 1, 0.7] : 0.9 }}
          transition={{ duration: 1 }}
        >
          OMNI Assistant
        </motion.h3>
        <motion.p
          key={currentMessage}
          className="text-lg text-muted-foreground"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          transition={{ duration: 0.5 }}
        >
          {messages[currentMessage]}
        </motion.p>
      </div>
    </motion.div>
  );
}
