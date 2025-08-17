'use client';

import { useState } from 'react';
import {
  useDynamicContext,
  useUserWallets,
} from '@dynamic-labs/sdk-react-core';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LogOut, Plus, Wallet } from 'lucide-react';
import WalletAvatar from './WalletAvatar';
import { DynamicWidget } from '@/lib/dynamic';

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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Switch Account
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add New Wallet Button */}
          <Card className="border-dashed border-2 border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors">
            <CardContent className="p-4">
              <Button
                variant="ghost"
                className="w-full h-auto p-4 flex flex-col items-center gap-2"
                onClick={handleAddNewWallet}
                disabled={false}
              >
                <Plus className="h-6 w-6 text-muted-foreground" />
                <span className="text-sm font-medium">Add New Wallet</span>
                <span className="text-xs text-muted-foreground">
                  Connect another wallet
                </span>
              </Button>
            </CardContent>
          </Card>

          {/* Connect Widget (shown when adding new wallet) */}
          {showConnectWidget && (
            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">Connect New Wallet</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowConnectWidget(false)}
                    >
                      ×
                    </Button>
                  </div>
                  <DynamicWidget />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Saved Wallets List */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">
              Saved Wallets
            </h3>

            {userWallets && userWallets.length > 0 ? (
              userWallets.map((wallet, index) => (
                <Card key={wallet.address} className="relative">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <WalletAvatar size={40} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">
                            {formatWalletName(wallet.address, index)}
                          </p>
                          {isPrimaryWallet(wallet.address) && (
                            <Badge variant="secondary" className="text-xs">
                              Active
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground font-mono">
                          {wallet.address}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSignOutWallet(wallet.address)}
                          className="text-destructive hover:text-destructive"
                          title="Sign out wallet"
                        >
                          <LogOut className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8">
                <Wallet className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No saved wallets
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Add a wallet to get started
                </p>
              </div>
            )}
          </div>

          {/* Info Text */}
          <div className="text-xs text-muted-foreground text-center">
            <p>You can manage multiple wallets and switch between them.</p>
            <p className="mt-1">The active wallet is used for transactions.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
