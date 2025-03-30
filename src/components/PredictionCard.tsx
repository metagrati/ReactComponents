// PredictionCard.tsx
import React from 'react';
import { ArrowUp, ArrowDown, Lock, Clock, CheckCircle2 } from 'lucide-react';
import { ConnectWalletButton } from './ConnectWalletButton';
// Example utility function if you have "cn" in "src/utils/cn.ts"
import { cn } from '@/utils/cn';
import { useCountdown } from '@/hooks/useCountdown';
import type { BigNumberish } from 'ethers';

export type RoundStatus = 'open' | 'locked' | 'closed' | 'future';

interface PredictionCardProps {
  epoch: number | null;
  title: string;
  amount: string;        // minimal bet
  currentPrice: string;  // current price
  players: string;
  timeLeft?: string;
  lockTimestamp?: BigNumberish;
  isConnected: boolean;
  isCurrentRound: boolean;
  isPaused: boolean;
  status: RoundStatus;
  onConnect: () => void;
  onPredictUp: () => Promise<void>;
  onPredictDown: () => Promise<void>;
  onTimerExpire?: () => void;
}

export const PredictionCard: React.FC<PredictionCardProps> = ({
  epoch,
  title,
  amount,
  currentPrice,
  players,
  lockTimestamp,
  isConnected,
  isCurrentRound,
  isPaused,
  status,
  onConnect,
  onPredictUp,
  onPredictDown,
  onTimerExpire
}) => {
  // Use the countdown hook for live updates
  const { timeLeft } = useCountdown(
    lockTimestamp ? Number(lockTimestamp) : undefined,
    onTimerExpire
  );

  const getStatusColor = () => {
    switch (status) {
      case 'open':
        return 'border-emerald-400 shadow-emerald-100';
      case 'locked':
        return 'border-yellow-400 shadow-yellow-100';
      case 'closed':
        return 'border-gray-300 shadow-gray-100';
      case 'future':
        return 'border-blue-300 shadow-blue-100';
      default:
        return 'border-gray-200';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'open':
        return <Clock className="w-5 h-5 text-emerald-500" />;
      case 'locked':
        return <Lock className="w-5 h-5 text-yellow-500" />;
      case 'closed':
        return <CheckCircle2 className="w-5 h-5 text-gray-500" />;
      case 'future':
        return <Clock className="w-5 h-5 text-blue-500" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'open':
        return 'Open for betting';
      case 'locked':
        return 'Locked';
      case 'closed':
        return 'Closed';
      case 'future':
        return 'Future round';
      default:
        return '';
    }
  };

  const renderActionButton = () => {
    if (isPaused) {
      return (
        <div className="h-[40px] flex items-center justify-center text-sm text-yellow-600 border-t mt-4 pt-4">
          Trading is paused
        </div>
      );
    }

    if (status === 'open') {
      if (!isConnected) {
        return (
          <ConnectWalletButton
            className="w-full"
            onConnectionSuccess={onConnect}
          />
        );
      }

      return (
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onPredictDown}
            className="bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg flex items-center justify-center text-sm font-medium transition-colors"
          >
            <ArrowDown className="w-4 h-4 mr-1.5" />
            Down
          </button>
          <button
            onClick={onPredictUp}
            className="bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-lg flex items-center justify-center text-sm font-medium transition-colors"
          >
            <ArrowUp className="w-4 h-4 mr-1.5" />
            Up
          </button>
        </div>
      );
    }

    if (!isConnected) {
      return (
        <ConnectWalletButton
          className="w-full"
          onConnectionSuccess={onConnect}
        />
      );
    }

    return (
      <div className="h-[40px] flex items-center justify-center text-sm text-gray-500 border-t mt-4 pt-4">
        Round is {status}
      </div>
    );
  };

  return (
    <div
      className={cn(
        'w-[358px] h-[580px] max-w-sm mx-auto flex flex-col overflow-hidden bg-white rounded-2xl p-4 shadow-lg border-2 transition-all duration-200',
        getStatusColor(),
        isPaused && 'opacity-75'
      )}
    >
      {/* Bring back the decorative blobs if you want */}
      {/* <CardDecoration /> */}

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">{title}</h2>
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className={cn(
            'text-sm font-medium',
            status === 'open' && 'text-emerald-600',
            status === 'locked' && 'text-yellow-600',
            status === 'closed' && 'text-gray-600',
            status === 'future' && 'text-blue-600'
          )}>
            {getStatusText()}
          </span>
        </div>
      </div>

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

      {renderActionButton()}
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
