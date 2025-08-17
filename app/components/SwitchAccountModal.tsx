'use client';

import {
  useDynamicContext,
  useUserWallets,
} from '@dynamic-labs/sdk-react-core';
import { LogOut, Plus, Wallet } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DynamicWidget } from '@/lib/dynamic';
import WalletAvatar from './WalletAvatar';

interface SwitchAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SwitchAccountModal({
  open,
  onOpenChange,
}: SwitchAccountModalProps) {
  const { handleLogOut, primaryWallet, handleUnlinkWallet } =
    useDynamicContext();
  const userWallets = useUserWallets();
  const [showConnectWidget, setShowConnectWidget] = useState(false);

  const handleAddNewWallet = async () => {
    setShowConnectWidget(true);
  };

  const handleSignOutWallet = async (walletAddress: string) => {
    try {
      // If it's the primary wallet, use handleLogOut
      if (primaryWallet?.address === walletAddress) {
        await handleLogOut();
      } else {
        // For other wallets, use handleUnlinkWallet if available
        if (handleUnlinkWallet) {
          await handleUnlinkWallet(walletAddress);
        }
      }
    } catch (error) {
      console.error('Failed to sign out wallet:', error);
    }
  };

  const formatWalletName = (address: string, index: number) => {
    // Try to get a meaningful name from the wallet
    const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
    return `Wallet ${index + 1} (${shortAddress})`;
  };

  const isPrimaryWallet = (address: string) => {
    return primaryWallet?.address === address;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border border-purple-500/30 bg-gradient-to-br from-purple-900/40 to-indigo-900/40 backdrop-blur-md rounded-2xl shadow-xl shadow-purple-500/10">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white text-xl md:text-2xl lg:text-3xl font-bold">
            <Wallet className="h-5 w-5" />
            Switch Account
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add New Wallet Button */}
          <div className="border-dashed border-2 border-purple-500/40 hover:border-purple-400/60 transition-colors rounded-2xl bg-purple-900/30">
            <div className="p-4">
              <Button
                variant="ghost"
                className="w-full h-auto p-4 flex flex-col items-center gap-2 bg-transparent hover:bg-white/10 text-white rounded-xl"
                onClick={handleAddNewWallet}
                disabled={false}
              >
                <Plus className="h-6 w-6 text-white/70" />
                <span className="text-sm font-medium text-white">
                  Add New Wallet
                </span>
                <span className="text-xs text-white/70">
                  Connect another wallet
                </span>
              </Button>
            </div>
          </div>

          {/* Connect Widget (shown when adding new wallet) */}
          {showConnectWidget && (
            <div className="border border-purple-500/30 bg-gradient-to-br from-purple-900/40 to-indigo-900/40 backdrop-blur-md rounded-2xl p-4 shadow-xl shadow-purple-500/10">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-white">
                    Connect New Wallet
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowConnectWidget(false)}
                    className="bg-purple-900/30 border border-purple-500/30 hover:bg-purple-800/40 text-white rounded-lg"
                  >
                    ×
                  </Button>
                </div>
                <DynamicWidget />
              </div>
            </div>
          )}

          {/* Saved Wallets List */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-white/80">Saved Wallets</h3>

            {userWallets && userWallets.length > 0 ? (
              userWallets.map((wallet, index) => (
                <div
                  key={wallet.address}
                  className="relative border border-purple-500/30 bg-gradient-to-br from-purple-900/40 to-indigo-900/40 backdrop-blur-md rounded-2xl p-4 shadow-xl shadow-purple-500/10"
                >
                  <div className="flex items-center gap-3">
                    <WalletAvatar size={40} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate text-white">
                          {formatWalletName(wallet.address, index)}
                        </p>
                        {isPrimaryWallet(wallet.address) && (
                          <Badge className="bg-green-500/20 text-green-300 border-green-500/30 border rounded-full px-2 py-1 text-xs font-medium">
                            Active
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-white/70 font-mono">
                        {wallet.address}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSignOutWallet(wallet.address)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 bg-purple-900/30 border border-purple-500/30 rounded-lg"
                        title="Sign out wallet"
                      >
                        <LogOut className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Wallet className="h-8 w-8 text-white/70 mx-auto mb-2" />
                <p className="text-sm text-white/70">No saved wallets</p>
                <p className="text-xs text-white/70 mt-1">
                  Add a wallet to get started
                </p>
              </div>
            )}
          </div>

          {/* Info Text */}
          <div className="text-xs text-white/70 text-center">
            <p>You can manage multiple wallets and switch between them.</p>
            <p className="mt-1">The active wallet is used for transactions.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
