'use client';

import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import Image from 'next/image';
import { getWalletProviderAvatar } from '@/lib/utils';

interface WalletAvatarProps {
  size?: number;
  className?: string;
}

export default function WalletAvatar({
  size = 48,
  className = '',
}: WalletAvatarProps) {
  const { user, primaryWallet } = useDynamicContext();

  // Get wallet provider avatar
  const walletType = primaryWallet?.connector?.name;
  const { src, alt } = getWalletProviderAvatar(walletType);

  // Fallback to user initials if no wallet type detected
  if (!walletType) {
    const userName = user?.firstName || user?.username || 'User';
    const userInitials = userName
      .split(' ')
      .map((name: string) => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    return (
      <div
        className={`bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold ${className}`}
        style={{ width: size, height: size, fontSize: `${size * 0.4}px` }}
      >
        {userInitials}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={`rounded-full ${className}`}
    />
  );
}
