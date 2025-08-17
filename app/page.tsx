'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { DynamicWidget } from '@/lib/dynamic';
import { useDarkMode } from '@/lib/useDarkMode';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useIsLoggedIn, useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useRouter } from 'next/navigation';
import WalletAvatar from '@/app/components/WalletAvatar';

export default function Main() {
  const { isDarkMode } = useDarkMode();
  const [isMounted, setIsMounted] = useState(false);
  const isLoggedIn = useIsLoggedIn();
  const { user, primaryWallet } = useDynamicContext();
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground transition-colors duration-300">
      <div className="absolute top-0 flex items-center justify-between w-full p-4">
        <Image
          className="h-8"
          src={isDarkMode ? '/logo-light.png' : '/logo-dark.png'}
          alt="dynamic"
          width={300}
          height={60}
        />
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() =>
              window.open(
                'https://docs.dynamic.xyz',
                '_blank',
                'noopener,noreferrer'
              )
            }
          >
            Docs
          </Button>
          <Button
            onClick={() =>
              window.open(
                'https://app.dynamic.xyz',
                '_blank',
                'noopener,noreferrer'
              )
            }
          >
            Get started
          </Button>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center gap-6 w-full max-w-4xl px-4">
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
          <div className="w-full max-w-2xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Welcome to OmniAgent!</h2>
              <p className="text-muted-foreground mb-6">
                Your wallet is connected. Here are your details:
              </p>
            </div>

            <Card className="w-full mb-8">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center gap-3">
                    <WalletAvatar size={48} />
                    <div className="text-left">
                      <h3 className="text-xl font-semibold">
                        {user?.firstName ||
                          user?.username ||
                          `User_${primaryWallet?.address?.slice(-4) || 'User'}`}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {primaryWallet?.address
                          ? `${primaryWallet.address.slice(0, 6)}...${primaryWallet.address.slice(-4)}`
                          : 'Connecting...'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                    <span>Status: Connected</span>
                    <span>•</span>
                    <span>Network: Ethereum</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="text-center">
              <Button
                onClick={() => router.push('/dashboard')}
                className="px-8 py-3 text-lg"
              >
                Go to DAO Dashboard
              </Button>
            </div>
          </div>
        )}
      </div>

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
