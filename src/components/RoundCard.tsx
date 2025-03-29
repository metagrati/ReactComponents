import React from 'react';
import { Wallet, CircleDollarSign, TrendingUp, Users, Timer, ArrowUp, ArrowDown } from 'lucide-react';

interface RoundCardProps {
  title: string;
  amount: string;
  onPredictUp: () => Promise<void>;
  onPredictDown: () => Promise<void>;
  isConnected: boolean;
  onConnect: () => Promise<void>;
}

const RoundCard: React.FC<RoundCardProps> = ({
  title,
  amount,
  onPredictUp,
  onPredictDown,
  isConnected,
  onConnect,
}) => {
  return (
    <div className="bg-white rounded-[24px] p-4 sm:p-5 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] w-full max-w-[340px] mx-auto relative overflow-hidden border border-gray-100">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-[140px] h-[140px] bg-gradient-to-br from-orange-100/40 to-yellow-100/40 rounded-full -mr-16 -mt-16 blur-2xl" />
      <div className="absolute bottom-0 left-0 w-[100px] h-[100px] bg-gradient-to-tr from-emerald-100/30 to-yellow-100/30 rounded-full -ml-12 -mb-12 blur-xl" />
      
      <div className="relative">
        {/* Header Section */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          <span className="px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full text-xs font-medium">Live</span>
          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-600 rounded-full text-xs font-medium">2x</span>
        </div>
        
        <h2 className="text-xl font-bold text-gray-900 mb-4">{title}</h2>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-2 mb-4">
          <div className="bg-gradient-to-br from-orange-50 to-yellow-50/50 rounded-lg p-2.5 border border-orange-100/50">
            <div className="flex items-center gap-1.5 mb-1">
              <CircleDollarSign className="w-4 h-4 text-orange-500" />
              <span className="text-xs text-gray-600 font-medium">Minimal Bet</span>
            </div>
            <p className="text-base font-bold text-gray-900">{amount} POL</p>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-50 to-yellow-50/50 rounded-lg p-2.5 border border-emerald-100/50">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span className="text-xs text-gray-600 font-medium">Current Price</span>
            </div>
            <p className="text-base font-bold text-gray-900">$71,850</p>
          </div>
          
          <div className="flex gap-2">
            <div className="flex-1 bg-gradient-to-br from-orange-50 to-yellow-50/50 rounded-lg p-2.5 border border-orange-100/50">
              <div className="flex items-center gap-1.5 mb-1">
                <Users className="w-4 h-4 text-orange-500" />
                <span className="text-xs text-gray-600 font-medium">Players</span>
              </div>
              <p className="text-base font-bold text-gray-900">124</p>
            </div>
            
            <div className="flex-1 bg-gradient-to-br from-emerald-50 to-yellow-50/50 rounded-lg p-2.5 border border-emerald-100/50">
              <div className="flex items-center gap-1.5 mb-1">
                <Timer className="w-4 h-4 text-emerald-500" />
                <span className="text-xs text-gray-600 font-medium">Time</span>
              </div>
              <p className="text-base font-bold text-gray-900">3m</p>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
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
              onClick={onPredictUp}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-2 px-4 rounded-lg flex items-center justify-center hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-lg shadow-emerald-500/20 font-medium text-sm"
            >
              <ArrowUp className="w-4 h-4 mr-1.5" />
              Up
            </button>
            <button
              onClick={onPredictDown}
              className="bg-gradient-to-r from-red-500 to-red-600 text-white py-2 px-4 rounded-lg flex items-center justify-center hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg shadow-red-500/20 font-medium text-sm"
            >
              <ArrowDown className="w-4 h-4 mr-1.5" />
              Down
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoundCard;