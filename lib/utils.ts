import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Wallet provider avatar mapping
export function getWalletProviderAvatar(walletType?: string): {
  src: string;
  alt: string;
} {
  if (!walletType) {
    return { src: '/wallet-icons/default.svg', alt: 'Wallet' };
  }

  const walletTypeLower = walletType.toLowerCase();

  // Map wallet types to their respective logos
  const walletAvatars: Record<string, { src: string; alt: string }> = {
    metamask: { src: '/wallet-icons/metamask.svg', alt: 'MetaMask' },
    walletconnect: {
      src: '/wallet-icons/walletconnect.svg',
      alt: 'WalletConnect',
    },
    coinbase: { src: '/wallet-icons/coinbase.svg', alt: 'Coinbase Wallet' },
    trust: { src: '/wallet-icons/trust.svg', alt: 'Trust Wallet' },
    rainbow: { src: '/wallet-icons/rainbow.svg', alt: 'Rainbow' },
    phantom: { src: '/wallet-icons/phantom.svg', alt: 'Phantom' },
    brave: { src: '/wallet-icons/brave.svg', alt: 'Brave Wallet' },
    argent: { src: '/wallet-icons/argent.svg', alt: 'Argent' },
    imtoken: { src: '/wallet-icons/imtoken.svg', alt: 'imToken' },
    okx: { src: '/wallet-icons/okx.svg', alt: 'OKX Wallet' },
    bitget: { src: '/wallet-icons/bitget.svg', alt: 'Bitget Wallet' },
    onekey: { src: '/wallet-icons/onekey.svg', alt: 'OneKey' },
    rabby: { src: '/wallet-icons/rabby.svg', alt: 'Rabby' },
    tokenpocket: { src: '/wallet-icons/tokenpocket.svg', alt: 'TokenPocket' },
    safe: { src: '/wallet-icons/safe.svg', alt: 'Safe' },
    zerion: { src: '/wallet-icons/zerion.svg', alt: 'Zerion' },
    unstoppable: {
      src: '/wallet-icons/unstoppable.svg',
      alt: 'Unstoppable Domains',
    },
    dynamic: { src: '/wallet-icons/dynamic.svg', alt: 'Dynamic' },
  };

  // Check for exact matches first
  if (walletAvatars[walletTypeLower]) {
    return walletAvatars[walletTypeLower];
  }

  // Check for partial matches
  for (const [key, value] of Object.entries(walletAvatars)) {
    if (walletTypeLower.includes(key) || key.includes(walletTypeLower)) {
      return value;
    }
  }

  // Fallback to default
  return { src: '/wallet-icons/default.svg', alt: 'Wallet' };
}
