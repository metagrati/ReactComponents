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

interface PlaceBetParams {
  direction: 'bull' | 'bear';
  amountEth: string;
}

// Structure for your round details; adapt fields to match your contract’s round struct
interface RoundData {
  startTimestamp: ethers.BigNumberish;
  lockTimestamp: ethers.BigNumberish;
  closeTimestamp: ethers.BigNumberish;
  lockPrice: ethers.BigNumberish;
  closePrice: ethers.BigNumberish;
  totalAmount: ethers.BigNumberish;
  bullAmount: ethers.BigNumberish;
  bearAmount: ethers.BigNumberish;
  // Add other fields your round struct may have
}

// Additional interface if you want typed dictionary for round data
interface RoundsDictionary {
  [epochNumber: number]: RoundData | null;
}

export const usePredictionGame = () => {
  const [contract, setContract] = useState<ethers.Contract | null>(null);

  const [epoch, setEpoch] = useState<number | null>(null);
  const [price, setPrice] = useState('0');
  const [minBet, setMinBet] = useState('0');
  const [paused, setPaused] = useState(false);

  // Here is the new piece of state for multiple rounds
  const [roundsData, setRoundsData] = useState<RoundsDictionary>({});

  // Reuse your userRounds logic
  const {
    rounds: userRounds,
    loading: userRoundsLoading,
    refresh: refreshUserRounds
  } = useUserRounds();

  /**
   * 1. Initialize contract
   */
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

  /**
   * Helper: Fetch data for one round by epoch
   */
  const fetchRoundData = useCallback(
    async (roundNumber: number): Promise<RoundData | null> => {
      if (!contract || roundNumber < 1) {
        // If your contract starts epochs at 1, skip negative or zero epochs
        return null;
      }
      try {
        // “rounds()” is a typical name in a Prediction contract that returns struct data by epoch
        // Adjust to your contract's function name if it’s different
        const roundInfo = await contract.rounds(roundNumber);

        // Return the raw struct, or shape it into an object if needed
        // (You can destructure or convert BigNumber to string as you wish.)
        return {
          startTimestamp: roundInfo.startTimestamp,
          lockTimestamp: roundInfo.lockTimestamp,
          closeTimestamp: roundInfo.closeTimestamp,
          lockPrice: roundInfo.lockPrice,
          closePrice: roundInfo.closePrice,
          totalAmount: roundInfo.totalAmount,
          bullAmount: roundInfo.bullAmount,
          bearAmount: roundInfo.bearAmount,
        };
      } catch (err) {
        console.warn(`No data for round #${roundNumber}`, err);
        return null;
      }
    },
    [contract]
  );

  /**
   * 2. Refresh overall game state (including the multiple round fetch)
   */
  const refreshGameState = useCallback(async () => {
    if (!contract) return;
    try {
      // Basic game info
      const [epochRaw, minBetRaw, pausedStatus] = await Promise.all([
        contract.currentEpoch(),
        contract.minBetAmount(),
        contract.paused()
      ]);
      const newEpoch = Number(epochRaw);

      setEpoch(newEpoch);
      setMinBet(ethers.formatEther(minBetRaw));
      setPaused(pausedStatus);

      // Price from the oracle
      const oracleAddress = await contract.oracle();
      const oracle = new ethers.Contract(
        oracleAddress,
        AggregatorV3InterfaceABI,
        contract.runner
      );
      const [, rawPrice] = await oracle.latestRoundData();
      setPrice(ethers.formatUnits(rawPrice, 8));

      // *** Key part: fetch multiple rounds (current-2, current-1, current, current+1) 
      if (newEpoch) {
        const targets = [newEpoch - 2, newEpoch - 1, newEpoch, newEpoch + 1];
        const fetched = await Promise.all(targets.map(fetchRoundData));

        // Build dictionary
        const updatedRoundsData: RoundsDictionary = {};
        targets.forEach((ep, i) => {
          updatedRoundsData[ep] = fetched[i];
        });
        setRoundsData(updatedRoundsData);
      }

      // Refresh user-specific data
      await refreshUserRounds();
    } catch (err) {
      console.error("Error fetching game state:", err);
    }
  }, [contract, fetchRoundData, refreshUserRounds]);

  /**
   * 3. Place Bet logic
   */
  const placeBet = useCallback(
    async ({ direction, amountEth }: PlaceBetParams) => {
      if (!contract) return;

      try {
        // Always fetch the latest epoch to avoid stale data
        const latestEpoch = Number(await contract.currentEpoch());
        setEpoch(latestEpoch);

        const fn: 'betBull' | 'betBear' =
          direction === 'bull' ? 'betBull' : 'betBear';
        const tx = await contract[fn](latestEpoch, {
          value: ethers.parseEther(amountEth),
        });
        await tx.wait();

        // Refresh after successful bet
        await refreshGameState();
        await refreshUserRounds();
      } catch (error) {
        console.error("Error placing bet:", error);
        throw error;
      }
    },
    [contract, refreshGameState, refreshUserRounds]
  );

  /**
   * 4. Kick off an initial load once we have the contract
   */
  useEffect(() => {
    if (contract) {
      refreshGameState();
    }
  }, [contract, refreshGameState]);

  // 5. Expose everything your UI needs
  return {
    epoch,
    price,
    minBet,
    paused,
    roundsData,           // <--- This now holds data for the 4 target epochs
    placeBet,
    refreshGameState,
    userRounds,
    userRoundsLoading,
    refreshUserRounds
  };
};
