import React from 'react';
import { cn } from '@/utils/cn';

interface UserBet {
  epoch: number;
  position: 'Bull' | 'Bear';
  amount: string;
  claimed: boolean;
  result: 'Win' | 'Lose' | 'Pending';
}

interface UserBetHistoryProps {
  bets: UserBet[];
}

const resultColors = {
  Win: 'bg-emerald-50 border-emerald-200',
  Lose: 'bg-red-50 border-red-200',
  Pending: 'bg-gray-50 border-gray-200',
};

const UserBetHistory: React.FC<UserBetHistoryProps> = ({ bets }) => {
  return (
    <div className="p-4 bg-white rounded-lg shadow-md max-w-xl mx-auto">
      <h3 className="text-lg font-semibold mb-3">Your Bet History</h3>
      <div className="space-y-2">
        {bets.map((bet) => (
          <div
            key={bet.epoch}
            className={cn(
              'p-3 rounded-lg border flex items-center justify-between text-sm',
              resultColors[bet.result]
            )}
          >
            <div>
              <span className="font-semibold">Round {bet.epoch}</span> ({bet.position})
            </div>
            <div>{bet.amount} POL</div>
            <div className="font-semibold">{bet.result}</div>
            <div>{bet.claimed ? 'Claimed ✅' : 'Not Claimed ❌'}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserBetHistory;
