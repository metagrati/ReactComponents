import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const blobKeyframes = {
  '0%': { transform: 'translate(0px, 0px) scale(1)' },
  '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
  '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
  '100%': { transform: 'translate(0px, 0px) scale(1)' }
};

const blobAnimation = {
  animation: 'blob 7s infinite'
};

export const Card: React.FC<CardProps> = ({ className, children, ...props }) => (
  <div 
    className={cn(
      "bg-white rounded-[24px] p-4 sm:p-5 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] relative overflow-hidden border border-gray-100",
      className
    )} 
    {...props}
  >
    {children}
  </div>
);

export const CardDecoration: React.FC = () => (
  <>
    <style>
      {`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}
    </style>
    <div className="hidden sm:block absolute -top-40 -left-40 w-80 h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
    <div className="hidden sm:block absolute -bottom-40 -right-40 w-80 h-80 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
    <div className="hidden sm:block absolute top-40 right-20 w-80 h-80 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />
  </>
);

export const CardContent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="relative">
    {children}
  </div>
);

export const CardBadge: React.FC<{ children: React.ReactNode; variant?: 'orange' | 'emerald' }> = ({ 
  children, 
  variant = 'orange' 
}) => (
  <span className={cn(
    "px-2 py-0.5 rounded-full text-xs font-medium",
    variant === 'orange' ? "bg-orange-100 text-orange-600" : "bg-emerald-100 text-emerald-600"
  )}>
    {children}
  </span>
);

export const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <h2 className={cn("text-xl font-bold text-gray-900 mb-4", className)}>{children}</h2>
);

export const CardStats: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="grid grid-cols-1 gap-2 mb-4">
    {children}
  </div>
);

export const CardStat: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  variant?: 'orange' | 'emerald';
}> = ({ icon, label, value, variant = 'orange' }) => (
  <div className={cn(
    "rounded-lg p-2.5 border",
    variant === 'orange' 
      ? "bg-gradient-to-br from-orange-50 to-yellow-50/50 border-orange-100/50" 
      : "bg-gradient-to-br from-emerald-50 to-yellow-50/50 border-emerald-100/50"
  )}>
    <div className="flex items-center gap-1.5 mb-1">
      {React.cloneElement(icon as React.ReactElement, { 
        className: cn(
          "w-4 h-4",
          variant === 'orange' ? "text-orange-500" : "text-emerald-500"
        )
      })}
      <span className="text-xs text-gray-600 font-medium">{label}</span>
    </div>
    <p className="text-base font-bold text-gray-900">{value}</p>
  </div>
);