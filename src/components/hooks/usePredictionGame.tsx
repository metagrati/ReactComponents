import { useEffect, useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { CONTRACTS } from '@/constants/contracts';
import { useUserRounds } from '@/components/hooks/useUserRounds';

declare const window: any;

const CONTRACT_ADDRESS = CONTRACTS.prediction.address;
const AggregatorV3InterfaceABI = [
  "function latestRoundData() view returns (uint80, int256, uint256, uint256, uint80)"
];
const ABI = CONTRACTS.prediction.abi;

export const usePredictionGame = () => {
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [epoch, setEpoch] = useState<number | null>(null);
  const [price, setPrice] = useState('0');
  const [minBet, setMinBet] = useState('0');
  const [paused, setPaused] = useState(false);
  const { rounds: userRounds, loading: userRoundsLoading, refresh: refreshUserRounds } = useUserRounds();



  useEffect(() => {
    const setup = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const instance = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
        setContract(instance);
      }
    };

    setup().catch((err) => {
      console.error('Failed to set up contract:', err);
    });
  }, []);


  const refreshGameState = useCallback(async () => {
    if (!contract) return;
    try {
      const [epochRaw, minBetRaw, pausedStatus] = await Promise.all([
        contract.currentEpoch(),
        contract.minBetAmount(),
        contract.paused()
      ]);
      setEpoch(Number(epochRaw));
      setMinBet(ethers.formatEther(minBetRaw));
      setPaused(pausedStatus);

      const oracleAddress = await contract.oracle();
      const oracle = new ethers.Contract(oracleAddress, AggregatorV3InterfaceABI, contract.runner);
      const [, rawPrice] = await oracle.latestRoundData();
      setPrice(ethers.formatUnits(rawPrice, 8));

      // Refresh user rounds here:
      await refreshUserRounds();

    } catch (err) {
      console.error("Error fetching game state:", err);
    }
  }, [contract, refreshUserRounds]);


  interface PlaceBetParams {
    direction: 'bull' | 'bear';
    amountEth: string;
  }

  const placeBet = useCallback(
    async ({ direction, amountEth }: PlaceBetParams) => {
      if (!contract || epoch === null) return;
      const fn: 'betBull' | 'betBear' = direction === 'bull' ? 'betBull' : 'betBear';
      const tx = await contract[fn](epoch, {
        value: ethers.parseEther(amountEth),
      });
      await tx.wait();
    },
    [contract, epoch]
  );

  useEffect(() => {
    if (contract) refreshGameState();
  }, [contract, refreshGameState]);

  return {
    epoch,
    price,
    minBet,
    paused,
    placeBet,
    refreshGameState,
    userRounds,
    userRoundsLoading,
    refreshUserRounds,
  };

};
