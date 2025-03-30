import React, { useEffect, useMemo } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import Carousel from '@/components/Carousel';
import UserBetHistory from '@/components/UserBetHistory';
import { usePredictionGame } from '@/components/hooks/usePredictionGame';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import type { RoundStatus } from '@/components/PredictionCard';

// Helper function to calculate time left with better formatting
const calculateTimeLeft = (lockTimestamp: ethers.BigNumberish): string => {
  const now = Math.floor(Date.now() / 1000);
  const lockTime = Number(lockTimestamp);
  const diff = lockTime - now;
  
  if (diff <= 0) return 'Round Ended';
  
  const minutes = Math.floor(diff / 60);
  const seconds = diff % 60;
  
  if (minutes > 0) {
    return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
  }
  return `${seconds}s`;
};

// Helper function to calculate total players with formatting
const calculatePlayers = (bullAmount: ethers.BigNumberish, bearAmount: ethers.BigNumberish): string => {
  const total = Number(bullAmount) + Number(bearAmount);
  return total.toLocaleString();
};

// Helper function to determine round status
const getRoundStatus = (
  roundData: any,
  currentEpoch: number,
  roundEpoch: number
): RoundStatus => {
  if (!roundData) return 'future';
  
  const now = Math.floor(Date.now() / 1000);
  const lockTime = Number(roundData.lockTimestamp);
  const closeTime = Number(roundData.closeTimestamp);

  if (roundEpoch > currentEpoch) return 'future';
  if (now >= closeTime) return 'closed';
  if (now >= lockTime) return 'locked';
  return 'open';
};

const App: React.FC = () => {
  const { isConnected } = useAccount();

  const {
    epoch,
    minBet,
    placeBet,
    refreshGameState,
    roundsData,
    userRounds,
    refreshUserRounds,
    userRoundsLoading,
    paused,
    error: gameError
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

    if (paused) {
      toast.error('Trading is currently paused');
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
      .map((ep) => {
        const roundData = roundsData[ep];
        const timeLeft = roundData ? calculateTimeLeft(roundData.lockTimestamp) : '0s';
        const players = roundData ? calculatePlayers(roundData.bullAmount, roundData.bearAmount) : '0';
        const isCurrentRound = ep === epoch;
        const status = getRoundStatus(roundData, epoch, ep);
        
        return {
          id: ep,
          epoch: ep,
          title: 'BTC/USD',
          amount: minBet?.toString() ?? '0',
          currentPrice: Number(ethers.formatUnits(roundData?.lockPrice ?? '0', 8)).toFixed(2),
          players,
          timeLeft,
          lockTimestamp: roundData?.lockTimestamp,
          isConnected,
          isCurrentRound,
          isPaused: paused,
          status,
          onConnect: () => refreshGameState(),
          onPredictUp: () => handlePredict('bull'),
          onPredictDown: () => handlePredict('bear'),
          onTimerExpire: () => {
            // Refresh game state when a timer expires to get updated round status
            refreshGameState();
          },
        };
      });
  }, [epoch, roundsData, minBet, isConnected, refreshGameState, paused]);

  // Show error state
  if (gameError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-emerald-50 flex flex-col items-center justify-center p-4">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md max-w-2xl">
          <p className="font-medium">Failed to load game state</p>
          <p className="text-sm mt-1">Please make sure your wallet is connected and try again</p>
        </div>
      </div>
    );
  }

  // Show loading state
  if (!epoch) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-emerald-50 flex flex-col items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        <p className="mt-4 text-gray-600">Loading game state...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-emerald-50 flex flex-col items-center justify-center p-4 gap-8">
      {paused && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md w-full max-w-2xl">
          <p className="font-medium">Trading is currently paused</p>
        </div>
      )}
      
      <Carousel items={carouselItems} />

      {userRoundsLoading ? (
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500"></div>
          <p className="text-gray-600">Loading bet history...</p>
        </div>
      ) : (
        <UserBetHistory bets={userRounds} />
      )}

      <Toaster position="bottom-right" />
    </div>
  );
};

export default App;
