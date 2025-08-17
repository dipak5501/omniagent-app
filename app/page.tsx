'use client';

import {
  useDynamicContext,
  useIsLoggedIn,
  useUserWallets,
} from '@dynamic-labs/sdk-react-core';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import UserProfile from '@/app/components/UserProfile';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DynamicWidget } from '@/lib/dynamic';
import { useDarkMode } from '@/lib/useDarkMode';

export default function Main() {
  const { isDarkMode } = useDarkMode();
  const [isMounted, setIsMounted] = useState(false);
  const isLoggedIn = useIsLoggedIn();
  const { user, primaryWallet } = useDynamicContext();
  const userWallets = useUserWallets();
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <Card className="p-8">
          <CardContent className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      {/* User Profile in Top Right (only when logged in) */}
      {isLoggedIn && (
        <div className="absolute top-4 right-4 z-10">
          <UserProfile />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 w-full max-w-4xl px-4 mx-auto">
        {!isLoggedIn ? (
          <>
            <Card className="w-full">
              <CardContent className="p-6">
                <DynamicWidget />
              </CardContent>
            </Card>

            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Welcome to OmniAgent</h2>
              <p className="text-muted-foreground mb-6">
                Connect your wallet to access the DAO Dashboard
              </p>
            </div>
          </>
        ) : (
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Welcome to OmniAgent!</h2>
            <p className="text-muted-foreground mb-8">
              Your wallet is connected. Here are your details:
            </p>

            <Card className="w-full max-w-md mx-auto mb-8">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                    {user?.username?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold">{user?.username || 'User'}</div>
                    <div className="text-sm text-muted-foreground">
                      {(() => {
                        const walletAddress =
                          primaryWallet?.address ||
                          userWallets?.[0]?.address ||
                          '';
                        return walletAddress && walletAddress !== 'Unknown'
                          ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
                          : 'Wallet Address';
                      })()}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Status: Connected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span>Network: Ethereum</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              size="lg"
              onClick={() => router.push('/dashboard')}
              className="px-8 py-3"
            >
              Go to DAO Dashboard
            </Button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 right-5">
        <div className="absolute bottom-1.5 right-5 text-muted-foreground text-sm font-medium z-10">
          Made with 💙 by dynamic
        </div>
        <Image
          className="h-60 w-auto ml-2"
          src={isDarkMode ? '/image-dark.png' : '/image-light.png'}
          alt="dynamic"
          width={400}
          height={300}
        />
      </div>
    </div>
  );
}
