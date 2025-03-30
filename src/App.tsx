import React, { useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { PredictionCard } from '@/components/PredictionCard';
import UserBetHistory from '@/components/UserBetHistory';
import { usePredictionGame } from '@/components/hooks/usePredictionGame';
import { useAccount } from 'wagmi';

const App: React.FC = () => {
  const { isConnected } = useAccount();

  const {
    epoch,
    price,
    minBet,
    paused,
    placeBet,
    refreshGameState,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-emerald-50 flex flex-col items-center justify-center p-4 gap-8">
      <PredictionCard
        epoch={epoch}
        title="BTC/USD"
        amount={minBet}
        currentPrice={price}
        players="128"
        timeLeft="3m"
        isConnected={isConnected}
        onConnect={() => {}}
        onPredictUp={() => handlePredict('bull')}
        onPredictDown={() => handlePredict('bear')}
      />

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
