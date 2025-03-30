// src/App.tsx
import React, { useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { PredictionCard } from '@/components/PredictionCard';

const App: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);

  const handleConnect = () => {
    setIsConnected(true);
    toast.success('Wallet connected!');
  };

  const predictUp = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }
    // ... do contract calls or any logic ...
  };

  const predictDown = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }
    // ... do contract calls or any logic ...
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-emerald-50 flex items-center justify-center p-4">
      <PredictionCard
        title="BTC/USD"
        amount = "0.0001"
        currentPrice = "78000"
        players = "128"
        timeLeft = "3m"
        isConnected={isConnected}
        onConnect={handleConnect}
        onPredictUp={predictUp}
        onPredictDown={predictDown}
      />
      <Toaster position="bottom-right" />
    </div>
  );
};

export default App;
