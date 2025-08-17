'use client';

import { useState } from 'react';
import {
  useDynamicContext,
  useUserWallets,
} from '@dynamic-labs/sdk-react-core';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ChevronDown,
  User,
  LogOut,
  Wallet,
  Eye,
  EyeOff,
  Copy,
  Check,
} from 'lucide-react';
import UserDetails from './UserDetails';
import WalletAvatar from './WalletAvatar';
import SwitchAccountModal from './SwitchAccountModal';

export default function UserProfile() {
  const { handleLogOut, user, primaryWallet } = useDynamicContext();
  const userWallets = useUserWallets();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showFullAddress, setShowFullAddress] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showAccountDetails, setShowAccountDetails] = useState(false);
  const [showSwitchAccount, setShowSwitchAccount] = useState(false);

  const handleLogout = async () => {
    try {
      await handleLogOut();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleSwitchAccount = () => {
    setShowSwitchAccount(true);
    setIsDropdownOpen(false);
  };

  const handleAccountDetails = () => {
    setShowAccountDetails(true);
    setIsDropdownOpen(false);
  };

  // Get the primary wallet address with better fallback handling
  const walletAddress =
    primaryWallet?.address || userWallets?.[0]?.address || '';

  // Navbar display - always show truncated address
  const displayAddress =
    walletAddress && walletAddress !== 'Unknown'
      ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
      : 'Connecting...';

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

  // Toggle wallet address visibility (only for dropdown content)
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
    <div className="relative">
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex items-center gap-2 px-3 py-2 h-auto hover:bg-accent"
          >
            <WalletAvatar size={32} />
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium">{userName}</span>
              <span className="text-xs text-muted-foreground">
                {displayAddress}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center gap-3">
                <WalletAvatar size={48} />
                <div className="flex flex-col">
                  <p className="text-sm font-medium leading-none">{fullName}</p>
                  <p className="text-xs leading-none text-muted-foreground mt-1">
                    {userEmail}
                  </p>
                </div>
              </div>
              {walletAddress && walletAddress !== 'Unknown' && (
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      Wallets Address
                    </p>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={copyToClipboard}
                        className="h-6 px-2 text-xs"
                      >
                        {copied ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleAddressVisibility}
                        className="h-6 px-2 text-xs"
                      >
                        {showFullAddress ? (
                          <EyeOff className="h-3 w-3" />
                        ) : (
                          <Eye className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs font-mono bg-muted px-2 py-1 rounded mt-1">
                    {showFullAddress
                      ? walletAddress
                      : '••••••••••••••••••••••••••••••••••••••••'}
                  </p>
                </div>
              )}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={handleAccountDetails}>
            <User className="mr-2 h-4 w-4" />
            <span>Account Details</span>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleSwitchAccount}>
            <Wallet className="mr-2 h-4 w-4" />
            <span>Switch Account</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={handleLogout} className="text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign Out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Account Details Dialog */}
      <Dialog open={showAccountDetails} onOpenChange={setShowAccountDetails}>
        <DialogContent className="max-w-8xl max-h-[100vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Account Details</DialogTitle>
          </DialogHeader>
          <UserDetails />
        </DialogContent>
      </Dialog>

      {/* Switch Account Modal */}
      <SwitchAccountModal
        open={showSwitchAccount}
        onOpenChange={setShowSwitchAccount}
      />
    </div>
  );
}
