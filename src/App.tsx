import React, { useEffect, useMemo } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { PredictionCard } from '@/components/PredictionCard';
import Carousel from '@/components/Carousel';
import UserBetHistory from '@/components/UserBetHistory';
import { usePredictionGame } from '@/components/hooks/usePredictionGame';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';

const App: React.FC = () => {
  const { isConnected } = useAccount();

  const {
    epoch,
    price,
    minBet,
    paused,
    placeBet,
    refreshGameState,
    roundsData,
    userRounds,
    refreshUserRounds,
    userRoundsLoading
  } = usePredictionGame();

  useEffect(() => {
    refreshGameState();
    refreshUserRounds();

    const interval = setInterval(() => {
      refreshGameState();
      refreshUserRounds();
    }, 15000);

    return () => clearInterval(interval);
  }, [refreshGameState, refreshUserRounds]);

  const handlePredict = async (direction: 'bull' | 'bear') => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      await placeBet({ direction, amountEth: minBet });
      toast.success(`Bet placed on ${direction.toUpperCase()}`);
      refreshGameState();
      refreshUserRounds();
    } catch (error) {
      toast.error('Failed to place bet');
      console.error(error);
    }
  };

  const carouselItems = useMemo(() => {
    if (!epoch) return [];
  
    const epochs = [epoch - 2, epoch - 1, epoch, epoch + 1];
  
    return epochs
      .filter((ep) => roundsData[ep])
      .map((ep) => ({
        id: ep,
        epoch: ep,
        title: 'BTC/USD',
        amount: minBet,
        currentPrice: Number(ethers.formatUnits(roundsData[ep]?.lockPrice, 8)).toFixed(2),
        players: '128', // dynamically fetch if you have it
        timeLeft: '3m', // dynamically calculate if you have it
        isConnected,
        onConnect: () => {},
        onPredictUp: () => handlePredict('bull'),
        onPredictDown: () => handlePredict('bear'),
      }));
  }, [epoch, roundsData, minBet, isConnected]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-emerald-50 flex flex-col items-center justify-center p-4 gap-8">
      <Carousel items={carouselItems} />

      {userRoundsLoading ? (
        <p className="text-center">Loading bet history...</p>
      ) : (
        <UserBetHistory bets={userRounds} />
      )}

      <Toaster position="bottom-right" />
    </div>
  );
};

export default App;
