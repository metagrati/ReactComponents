// src/components/ConnectWalletButton.tsx
import React, { useEffect } from 'react';
import { Wallet } from 'lucide-react';
import { createAppKit } from '@reown/appkit';
import { useAccount } from 'wagmi';
import { polygon } from '@reown/appkit/networks';

// Import the same wagmiAdapter from main.tsx
import { wagmiAdapter } from '@/main';

interface ConnectWalletButtonProps {
  className?: string;
  onConnectionSuccess: () => void;
}

export const ConnectWalletButton: React.FC<ConnectWalletButtonProps> = ({
  className = '',
  onConnectionSuccess,
}) => {
  /**
   * Create a Reown modal with the same wagmiAdapter.
   * Remove or rename any properties that your TS definitions don't allow
   * (such as 'modalConfig' or 'autoConnect' or 'connectMethodsOrder').
   */
  const modal = createAppKit({
    adapters: [wagmiAdapter],
    networks: [polygon],
    projectId: '9ba0d4ac5db061b3efb559c91eabfef5',
    metadata: {
      name: 'ProfitFlip',
      description: 'Prediction App',
      url: 'https://profitflip.online',
      icons: ['https://assets.reown.com/reown-profile-pic.png'],
    },
    features: {
      analytics: true,
      connectMethodsOrder: ['wallet'],
    }
  });

  // Wagmi's built-in hook to see if the user is connected
  const { isConnected } = useAccount();

  // Once wagmi sees `isConnected = true`, notify the parent
  useEffect(() => {
    if (isConnected) {
      onConnectionSuccess();
    }
  }, [isConnected, onConnectionSuccess]);

  return (
    <button
      onClick={() => modal.open()}
      className={`flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors ${className}`}
    >
      <Wallet className="w-5 h-5" />
      Connect Wallet
    </button>
  );
};
