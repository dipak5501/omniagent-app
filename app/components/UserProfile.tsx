'use client';

import {
  useDynamicContext,
  useUserWallets,
} from '@dynamic-labs/sdk-react-core';
import {
  Check,
  ChevronDown,
  Copy,
  Eye,
  EyeOff,
  LogOut,
  User,
  Wallet,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import SwitchAccountModal from './SwitchAccountModal';
import UserDetails from './UserDetails';
import WalletAvatar from './WalletAvatar';

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
            className="flex items-center gap-2 px-3 py-2 h-auto bg-purple-900/30 border border-purple-500/30 hover:bg-purple-800/40 text-white rounded-xl"
          >
            <WalletAvatar size={32} />
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium text-white">{userName}</span>
              <span className="text-xs text-white/70">{displayAddress}</span>
            </div>
            <ChevronDown className="h-4 w-4 text-white/70" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-80 border border-purple-500/30 bg-gradient-to-br from-purple-900/40 to-indigo-900/40 backdrop-blur-md rounded-2xl shadow-xl shadow-purple-500/10"
        >
          <DropdownMenuLabel className="font-normal text-white">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center gap-3">
                <WalletAvatar size={48} />
                <div className="flex flex-col">
                  <p className="text-sm font-medium leading-none text-white">
                    {fullName}
                  </p>
                  <p className="text-xs leading-none text-white/70 mt-1">
                    {userEmail}
                  </p>
                </div>
              </div>
              {walletAddress && walletAddress !== 'Unknown' && (
                <div className="pt-2 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-white/70">Wallets Address</p>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={copyToClipboard}
                        className="h-6 px-2 text-xs bg-purple-900/30 border border-purple-500/30 hover:bg-purple-800/40 text-white rounded-lg"
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
                        className="h-6 px-2 text-xs bg-purple-900/30 border border-purple-500/30 hover:bg-purple-800/40 text-white rounded-lg"
                      >
                        {showFullAddress ? (
                          <EyeOff className="h-3 w-3" />
                        ) : (
                          <Eye className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs font-mono bg-purple-900/30 border border-purple-500/30 px-2 py-1 rounded-lg mt-1 text-white">
                    {showFullAddress
                      ? walletAddress
                      : '••••••••••••••••••••••••••••••••••••••••'}
                  </p>
                </div>
              )}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-white/10" />

          <DropdownMenuItem
            onClick={handleAccountDetails}
            className="text-white hover:bg-white/10 focus:bg-white/10"
          >
            <User className="mr-2 h-4 w-4" />
            <span>Account Details</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={handleSwitchAccount}
            className="text-white hover:bg-white/10 focus:bg-white/10"
          >
            <Wallet className="mr-2 h-4 w-4" />
            <span>Switch Account</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="bg-white/10" />

          <DropdownMenuItem
            onClick={handleLogout}
            className="text-red-400 hover:bg-red-500/10 focus:bg-red-500/10"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign Out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Account Details Dialog */}
      <Dialog open={showAccountDetails} onOpenChange={setShowAccountDetails}>
        <DialogContent className="max-w-8xl max-h-[100vh] overflow-y-auto border border-purple-500/30 bg-gradient-to-br from-purple-900/40 to-indigo-900/40 backdrop-blur-md rounded-2xl shadow-xl shadow-purple-500/10">
          <DialogHeader>
            <DialogTitle className="text-white text-xl md:text-2xl lg:text-3xl font-bold">
              Account Details
            </DialogTitle>
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
