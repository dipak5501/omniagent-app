'use client';
import { isEthereumWallet } from '@dynamic-labs/ethereum';
import {
  useDynamicContext,
  useIsLoggedIn,
  useUserWallets,
} from '@dynamic-labs/sdk-react-core';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DynamicMethodsProps {
  isDarkMode: boolean;
}

// biome-ignore lint/correctness/noUnusedFunctionParameters: let it be for now
export default function DynamicMethods({ isDarkMode }: DynamicMethodsProps) {
  const isLoggedIn = useIsLoggedIn();
  const { sdkHasLoaded, primaryWallet, user } = useDynamicContext();
  const userWallets = useUserWallets();
  const [isLoading, setIsLoading] = useState(true);
  const [result, setResult] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const safeStringify = (obj: unknown): string => {
    const seen = new WeakSet();
    return JSON.stringify(
      obj,
      (_key, value) => {
        if (typeof value === 'object' && value !== null) {
          if (seen.has(value)) {
            return '[Circular]';
          }
          seen.add(value);
        }
        return value;
      },
      2
    );
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (sdkHasLoaded && isLoggedIn && primaryWallet) {
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
  }, [sdkHasLoaded, isLoggedIn, primaryWallet]);

  function clearResult() {
    setResult('');
    setError(null);
  }

  function showUser() {
    try {
      setResult(safeStringify(user));
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to stringify user data'
      );
    }
  }

  function showUserWallets() {
    try {
      setResult(safeStringify(userWallets));
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to stringify wallet data'
      );
    }
  }

  async function fetchEthereumPublicClient() {
    if (!primaryWallet || !isEthereumWallet(primaryWallet)) {
      return;
    }
    try {
      setIsLoading(true);
      const result = await primaryWallet.getPublicClient();
      setResult(safeStringify(result));
    } catch (error) {
      setResult(
        safeStringify({
          error:
            error instanceof Error ? error.message : 'Unknown error occurred',
        })
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchEthereumWalletClient() {
    if (!primaryWallet || !isEthereumWallet(primaryWallet)) {
      return;
    }
    try {
      setIsLoading(true);
      const result = await primaryWallet.getWalletClient();
      setResult(safeStringify(result));
    } catch (error) {
      setResult(
        safeStringify({
          error:
            error instanceof Error ? error.message : 'Unknown error occurred',
        })
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchEthereumMessage() {
    if (!primaryWallet || !isEthereumWallet(primaryWallet)) {
      return;
    }
    try {
      setIsLoading(true);
      const result = await primaryWallet.signMessage('Hello World');
      setResult(safeStringify(result));
    } catch (error) {
      setResult(
        safeStringify({
          error:
            error instanceof Error ? error.message : 'Unknown error occurred',
        })
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      {isMounted && !isLoading && (
        <Card className="w-full max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Dynamic Methods
              <Badge variant="secondary">Connected</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap justify-center gap-2">
              <Button onClick={showUser} variant="default">
                Fetch User
              </Button>
              <Button onClick={showUserWallets} variant="secondary">
                Fetch User Wallets
              </Button>

              {primaryWallet && isEthereumWallet(primaryWallet) && (
                <>
                  <Button onClick={fetchEthereumPublicClient} variant="outline">
                    Fetch PublicClient
                  </Button>
                  <Button onClick={fetchEthereumWalletClient} variant="outline">
                    Fetch WalletClient
                  </Button>
                  <Button onClick={fetchEthereumMessage} variant="outline">
                    Fetch Message
                  </Button>
                </>
              )}
            </div>

            {(result || error) && (
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  {error ? (
                    <pre className="whitespace-pre-wrap break-words max-w-full text-destructive text-sm">
                      {error}
                    </pre>
                  ) : (
                    <pre className="whitespace-pre-wrap break-words max-w-full text-sm">
                      {result}
                    </pre>
                  )}
                </CardContent>
              </Card>
            )}

            {(result || error) && (
              <div className="flex justify-center">
                <Button onClick={clearResult} variant="destructive" size="sm">
                  Clear
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
}
