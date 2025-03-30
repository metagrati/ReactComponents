import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useAccount } from 'wagmi';
import { CONTRACTS } from '@/constants/contracts';

interface RoundInfo {
  epoch: number;
  position: 'Bull' | 'Bear';
  amount: string;
  claimed: boolean;
  result: 'Win' | 'Lose' | 'Pending';
}

export const useUserRounds = () => {
  const { address } = useAccount();
  const [rounds, setRounds] = useState<RoundInfo[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUserRounds = useCallback(async () => {
    if (!address || !window.ethereum) return;

    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        CONTRACTS.prediction.address,
        CONTRACTS.prediction.abi,
        provider,
      );

      const roundsLength = await contract.getUserRoundsLength(address);
      const cursor = 0;
      const size = roundsLength;

      const [epochs, betInfos] = await contract.getUserRounds(address, cursor, size);

      const formattedRounds: RoundInfo[] = await Promise.all(
        epochs.map(async (epoch: ethers.BigNumberish, idx: number) => {
          const betInfo = betInfos[idx];
          const round = await contract.rounds(epoch);
          const oracleCalled = round.oracleCalled;
          let result: 'Win' | 'Lose' | 'Pending' = 'Pending';

          if (oracleCalled) {
            const lockPrice = round.lockPrice;
            const closePrice = round.closePrice;

            if (closePrice === lockPrice) {
              result = 'Pending';
            } else if (
              (closePrice > lockPrice && betInfo.position === 0) ||
              (closePrice < lockPrice && betInfo.position === 1)
            ) {
              result = 'Win';
            } else {
              result = 'Lose';
            }
          }

          return {
            epoch: Number(epoch),
            position: betInfo.position === 0 ? 'Bull' : 'Bear',
            amount: ethers.formatEther(betInfo.amount),
            claimed: betInfo.claimed,
            result,
          };
        })
      );

      setRounds(formattedRounds);
    } catch (error) {
      console.error('Failed to fetch user rounds:', error);
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchUserRounds();
  }, [fetchUserRounds]);

  return { rounds, loading, refresh: fetchUserRounds };
};
