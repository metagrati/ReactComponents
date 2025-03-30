import { useState, useEffect, useCallback } from 'react';

interface CountdownState {
  timeLeft: string;
  isExpired: boolean;
}

export const useCountdown = (
  targetTimestamp: number | undefined,
  onExpire?: () => void
): CountdownState => {
  const [state, setState] = useState<CountdownState>({
    timeLeft: '0s',
    isExpired: true
  });

  const calculateTimeLeft = useCallback(() => {
    if (!targetTimestamp) return { timeLeft: '0s', isExpired: true };

    const now = Math.floor(Date.now() / 1000);
    const diff = targetTimestamp - now;

    if (diff <= 0) {
      return { timeLeft: 'Round Ended', isExpired: true };
    }

    const minutes = Math.floor(diff / 60);
    const seconds = diff % 60;

    const timeLeft = minutes > 0
      ? `${minutes}m ${seconds.toString().padStart(2, '0')}s`
      : `${seconds}s`;

    return { timeLeft, isExpired: false };
  }, [targetTimestamp]);

  useEffect(() => {
    // Initial calculation
    setState(calculateTimeLeft());

    // Only start interval if we have a valid timestamp
    if (!targetTimestamp) return;

    const interval = setInterval(() => {
      const newState = calculateTimeLeft();
      setState(newState);

      // Call onExpire callback when timer expires
      if (newState.isExpired && onExpire) {
        onExpire();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetTimestamp, calculateTimeLeft, onExpire]);

  return state;
}; 