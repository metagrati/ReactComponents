import React from 'react';
import { Wallet, CircleDollarSign, TrendingUp, Users, Timer, ArrowUp, ArrowDown } from 'lucide-react';
import { Card, CardDecoration, CardContent, CardBadge, CardTitle, CardStats, CardStat } from '@/components/ui/Card';

interface PredictionCardProps {
  title: string;
  amount: string;
  currentPrice: string;
  players: string;
  timeLeft: string;
  onPredictUp: () => Promise<void>;
  onPredictDown: () => Promise<void>;
  isConnected: boolean;
  onConnect: () => Promise<void>;
}

const PredictionCard: React.FC<PredictionCardProps> = ({
  title,
  amount,
  currentPrice,
  players,
  timeLeft,
  onPredictUp,
  onPredictDown,
  isConnected,
  onConnect,
}) => {
  return (
    <Card className="w-full max-w-[340px] mx-auto">
      <CardDecoration />
      <CardContent>
        <div className="flex items-center justify-between mb-3">
          <CardBadge variant="orange">Live</CardBadge>
          <CardBadge variant="emerald">2x</CardBadge>
        </div>
        
        <CardTitle className="text-center">{title}</CardTitle>
        
        <CardStats>
          <CardStat
            icon={<CircleDollarSign />}
            label="Minimal Bet"
            value={`${amount} POL`}
            variant="orange"
          />
          
          <CardStat
            icon={<TrendingUp />}
            label="Current Price"
            value={currentPrice}
            variant="emerald"
          />
          
          <div className="flex gap-2">
            <div className="flex-1">
              <CardStat
                icon={<Users />}
                label="Players"
                value={players}
                variant="orange"
              />
            </div>
            
            <div className="flex-1">
              <CardStat
                icon={<Timer />}
                label="Time"
                value={timeLeft}
                variant="emerald"
              />
            </div>
          </div>
        </CardStats>
        
        {!isConnected ? (
          <button
            onClick={onConnect}
            className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white py-2 px-4 rounded-lg flex items-center justify-center hover:from-orange-600 hover:to-yellow-600 transition-all duration-200 shadow-lg shadow-orange-500/20 font-medium text-sm"
          >
            <Wallet className="w-4 h-4 mr-2" />
            Connect Wallet
          </button>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onPredictDown}
              className="bg-gradient-to-r from-red-500 to-red-600 text-white py-2 px-4 rounded-lg flex items-center justify-center hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg shadow-red-500/20 font-medium text-sm"
            >
              <ArrowDown className="w-4 h-4 mr-1.5" />
              Down
            </button>
            <button
              onClick={onPredictUp}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-2 px-4 rounded-lg flex items-center justify-center hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-lg shadow-emerald-500/20 font-medium text-sm"
            >
              <ArrowUp className="w-4 h-4 mr-1.5" />
              Up
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PredictionCard;