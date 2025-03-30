// PredictionCard.tsx
import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { ConnectWalletButton } from './ConnectWalletButton';
// Example utility function if you have “cn” in "src/utils/cn.ts"
import { cn } from '@/utils/cn';

// Reintroduce the props for stats
interface PredictionCardProps {
  epoch: number | null;
  title: string;
  amount: string;        // minimal bet
  currentPrice: string;  // current price
  players: string;
  timeLeft: string;
  isConnected: boolean;
  onConnect: () => void;
  onPredictUp: () => Promise<void>;
  onPredictDown: () => Promise<void>;
}

export const PredictionCard: React.FC<PredictionCardProps> = ({
  epoch,
  title,
  amount,
  currentPrice,
  players,
  timeLeft,
  isConnected,
  onConnect,
  onPredictUp,
  onPredictDown,
}) => {
  return (
    <div
      className={cn(
        'w-[358px] h-[580px] max-w-sm mx-auto flex flex-col overflow-hidden bg-white rounded-2xl p-4 shadow-lg border relative'
      )}
    >
      {/* Bring back the decorative blobs if you want */}
      {/* <CardDecoration /> */}

      <h2 className="text-xl font-bold text-center mb-6">{title}</h2>

      {epoch !== null && (
        <h3 className="text-sm text-center text-gray-500 mb-4">Round #{epoch}</h3>
      )}

      <div className="flex-grow">
        <div className="mt-4 space-y-3">
          <CardStat label="Minimal Bet" value={`${amount} POL`} color="orange" />
          <CardStat
            label="Current Price"
            value={`₿ ${currentPrice}`}
            color="green"
          />
          <CardStat label="Players" value={players} color="orange" />
          <CardStat label="Time Left" value={timeLeft} color="green" />
        </div>
      </div>

      <div className="mt-auto">
        {!isConnected ? (
          <ConnectWalletButton
            className="w-full"
            onConnectionSuccess={onConnect}
          />
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onPredictDown}
              className="bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg flex items-center justify-center text-sm font-medium"
            >
              <ArrowDown className="w-4 h-4 mr-1.5" />
              Down
            </button>
            <button
              onClick={onPredictUp}
              className="bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-lg flex items-center justify-center text-sm font-medium"
            >
              <ArrowUp className="w-4 h-4 mr-1.5" />
              Up
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Example decorative blobs
const CardDecoration = () => (
  <>
    <style>
      {`
        @keyframes blob {
          0% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0, 0) scale(1); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .delay-2s { animation-delay: 2s; }
        .delay-4s { animation-delay: 4s; }
      `}
    </style>
    <div className="absolute inset-0 pointer-events-none z-0">
      <div className="absolute -top-40 -left-40 w-80 h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
      <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob delay-2s" />
      <div className="absolute top-40 right-20 w-80 h-80 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob delay-4s" />
    </div>
  </>
);

// Simple stat component
const CardStat: React.FC<{
  label: string;
  value: string;
  color: 'orange' | 'green';
}> = ({ label, value, color }) => (
  <div
    className={cn(
      'p-2 rounded border text-sm',
      color === 'orange'
        ? 'bg-orange-50 border-orange-200'
        : 'bg-emerald-50 border-emerald-200'
    )}
  >
    <div className="text-xs text-gray-600 font-medium mb-1">{label}</div>
    <div className="text-sm font-bold text-gray-900">{value}</div>
  </div>
);
