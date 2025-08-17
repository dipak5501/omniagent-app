import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useState } from 'react';
import { DynamicWidget } from '@/lib/dynamic';
import { AIAssistant } from './AIAssistant';

export function FuturisticLoginForm() {
  const [isLoading, _setIsLoading] = useState(false);
  const [_isScanning, _setIsScanning] = useState(false);
  const [step, _setStep] = useState(1);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useTransform(mouseY, [-300, 300], [10, -10]);
  const rotateY = useTransform(mouseX, [-300, 300], [-10, 10]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set(e.clientX - centerX);
    mouseY.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // Commented out since we're using DynamicWidget instead
  // const handleWalletConnect = async () => {
  //   setIsLoading(true);
  //   setIsScanning(true);
  //   setStep(1);

  //   setTimeout(() => {
  //     setStep(2);
  //     setTimeout(() => {
  //       setStep(3);
  //       setTimeout(() => {
  //         setIsLoading(false);
  //         setIsScanning(false);
  //         console.log('Wallet connection initiated');
  //       }, 1000);
  //     }, 1500);
  //   }, 2000);
  // };

  return (
    <motion.div
      className="relative perspective-1000"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, ease: 'easeOut' }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-cyan-500/20 rounded-3xl blur-xl"
        animate={{
          background: [
            'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2), rgba(6, 182, 212, 0.2))',
            'linear-gradient(135deg, rgba(147, 51, 234, 0.2), rgba(6, 182, 212, 0.2), rgba(59, 130, 246, 0.2))',
            'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2))',
          ],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        style={{ rotateX, rotateY }}
      />

      <motion.div
        className="relative backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-12 shadow-2xl"
        style={{
          rotateX,
          rotateY,
          boxShadow:
            '0 25px 50px -12px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        }}
      >
        <AIAssistant />

        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <h1 className="text-5xl mb-4 bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
            OmniAgent Portal
          </h1>
          <p className="text-white/70 text-xl">
            Connect Your Wallet to Access DAO Governance
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="flex justify-center items-center w-full px-4"
        >
          <div className="flex justify-center items-center w-full">
            <DynamicWidget />
          </div>
        </motion.div>

        {/* Original connect wallet button - commented out
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <Button
            onClick={handleWalletConnect}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-0 h-20 rounded-2xl text-xl shadow-lg"
            disabled={isLoading}
          >
            <div className="flex items-center justify-center space-x-4">
              {isLoading ? (
                <>
                  <Scan className="w-8 h-8" />
                  <span className="text-xl">
                    {step === 1 && 'Scanning Wallet...'}
                    {step === 2 && 'Verifying Connection...'}
                    {step === 3 && 'Access Granted!'}
                  </span>
                </>
              ) : (
                <>
                  <Wallet className="w-8 h-8" />
                  <span className="text-xl">Connect Wallet</span>
                  <Zap className="w-6 h-6 ml-2 opacity-70" />
                </>
              )}
            </div>
          </Button>
        </motion.div>
        */}

        {isLoading && (
          <motion.div
            className="mt-8 space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex justify-center space-x-8 text-lg">
              <div
                className={`flex items-center space-x-3 ${step >= 1 ? 'text-blue-400' : 'text-white/40'}`}
              >
                <div
                  className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-blue-400' : 'bg-white/20'}`}
                />
                <span>Wallet Scan</span>
              </div>

              <div
                className={`flex items-center space-x-3 ${step >= 2 ? 'text-purple-400' : 'text-white/40'}`}
              >
                <div
                  className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-purple-400' : 'bg-white/20'}`}
                />
                <span>Connection Verify</span>
              </div>

              <div
                className={`flex items-center space-x-3 ${step >= 3 ? 'text-green-400' : 'text-white/40'}`}
              >
                <div
                  className={`w-3 h-3 rounded-full ${step >= 3 ? 'bg-green-400' : 'bg-white/20'}`}
                />
                <span>Access Granted</span>
              </div>
            </div>

            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 rounded-full"
                initial={{ width: '0%' }}
                animate={{
                  width:
                    step === 1
                      ? '33%'
                      : step === 2
                        ? '66%'
                        : step === 3
                          ? '100%'
                          : '0%',
                }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
              />
            </div>
          </motion.div>
        )}

        <motion.div
          className="text-center text-lg mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          <p className="text-white/60">
            {isLoading
              ? 'Authenticating wallet connection...'
              : 'Ready for secure DAO access'}
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
