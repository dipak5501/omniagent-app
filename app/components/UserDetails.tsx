'use client';

import {
  useDynamicContext,
  useUserWallets,
} from '@dynamic-labs/sdk-react-core';
import {
  Calendar,
  Check,
  Copy,
  Eye,
  EyeOff,
  Mail,
  User,
  Wallet,
} from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import WalletAvatar from './WalletAvatar';

export default function UserDetails() {
  const { user, primaryWallet } = useDynamicContext();
  const userWallets = useUserWallets();
  const [showFullAddress, setShowFullAddress] = useState(false);
  const [copied, setCopied] = useState(false);

  // Get the primary wallet address
  const walletAddress =
    primaryWallet?.address || userWallets?.[0]?.address || '';

  // Get user's name with better fallbacks - try to get from user object or generate from wallet
  const userName =
    user?.firstName ||
    user?.username ||
    user?.email?.split('@')[0] ||
    (walletAddress ? `User_${walletAddress.slice(-4)}` : 'User');
  const userEmail = user?.email || 'No email provided';

  // Get user's full name if available
  const fullName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : userName;

  // Get user's join date (if available)
  const joinDate = 'Today';

  // Toggle wallet address visibility
  const toggleAddressVisibility = () => {
    setShowFullAddress(!showFullAddress);
  };

  // Copy wallet address to clipboard
  const copyToClipboard = async () => {
    if (walletAddress) {
      try {
        await navigator.clipboard.writeText(walletAddress);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy address:', err);
      }
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          User Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <WalletAvatar size={64} />
          <div className="flex-1">
            <h3 className="text-lg font-semibold">{fullName}</h3>
            <p className="text-sm text-muted-foreground">{userEmail}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary">Active</Badge>
              <span className="text-xs text-muted-foreground">
                Member since {joinDate}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>Email</span>
            </div>
            <p className="text-sm font-medium">{userEmail}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Joined</span>
            </div>
            <p className="text-sm font-medium">{joinDate}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>Username</span>
            </div>
            <p className="text-sm font-medium">{userName}</p>
          </div>
        </div>

        {walletAddress && (
          <div className="pt-4 border-t">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Wallet className="h-4 w-4" />
                  <span>Full Wallet Address</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyToClipboard}
                    className="h-8 px-2"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleAddressVisibility}
                    className="h-8 px-2"
                  >
                    {showFullAddress ? (
                      <>
                        <EyeOff className="h-4 w-4 mr-1" />
                        Hide
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-1" />
                        Show
                      </>
                    )}
                  </Button>
                </div>
              </div>
              <p className="text-xs font-mono bg-muted px-3 py-2 rounded break-all">
                {showFullAddress
                  ? walletAddress
                  : '••••••••••••••••••••••••••••••••••••••••'}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
