import { useEffect, useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { CONTRACTS } from '@/constants/contracts';
import { useUserRounds } from '@/components/hooks/useUserRounds';

declare const window: any;

const CONTRACT_ADDRESS = CONTRACTS.prediction.address;
const AggregatorV3InterfaceABI = [
  "function latestRoundData() view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)"
];
const ABI = CONTRACTS.prediction.abi;

interface PlaceBetParams {
  direction: 'bull' | 'bear';
  amountEth: string;
}

// Structure for your round details; adapt fields to match your contract's round struct
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
  const [error, setError] = useState<Error | null>(null);
  const [provider, setProvider] = useState<ethers.Provider | null>(null);

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

  // Initialize provider
  useEffect(() => {
    const setup = async () => {
      try {
        // Use a public RPC endpoint for Polygon mainnet
        const fallbackProvider = new ethers.JsonRpcProvider('https://polygon-rpc.com');
        setProvider(fallbackProvider);
        setError(null);
      } catch (err) {
        console.error('Failed to set up provider:', err);
        setError(err instanceof Error ? err : new Error('Failed to set up provider'));
      }
    };

    setup();
  }, []);

  // Set up contract with provider
  useEffect(() => {
    if (!provider) return;

    const setupContract = async () => {
      try {
        const instance = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
        
        // Test if contract is accessible
        await instance.paused();
        
        setContract(instance);
        setError(null);
      } catch (err) {
        console.error('Failed to set up contract:', err);
        setError(err instanceof Error ? err : new Error('Failed to set up contract'));
      }
    };

    setupContract();
  }, [provider]);

  /**
   * Helper: Fetch data for one round by epoch
   */
  const fetchRoundData = useCallback(
    async (roundNumber: number): Promise<RoundData | null> => {
      if (!contract || roundNumber < 1) return null;
      
      try {
        const roundInfo = await contract.rounds(roundNumber);
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
      // Fetch basic game info
      const [epochBN, minBetBN, pausedStatus] = await Promise.all([
        contract.currentEpoch(),
        contract.minBetAmount(),
        contract.paused()
      ]);

      // Handle epoch conversion more robustly
      const newEpoch = typeof epochBN === 'object' && epochBN.toNumber ? 
        epochBN.toNumber() : 
        Number(epochBN);

      setEpoch(newEpoch);
      
      // Handle minBet conversion more robustly
      const minBetValue = typeof minBetBN === 'object' && minBetBN.toString ? 
        minBetBN.toString() : 
        minBetBN.toString();
      setMinBet(ethers.formatEther(minBetValue));
      
      setPaused(pausedStatus);

      // Fetch price from oracle
      try {
        const oracleAddress = await contract.oracle();
        const oracle = new ethers.Contract(
          oracleAddress,
          AggregatorV3InterfaceABI,
          contract.runner
        );
        const [, answer] = await oracle.latestRoundData();
        setPrice(ethers.formatUnits(answer, 8));
      } catch (oracleErr) {
        console.warn('Failed to fetch oracle price:', oracleErr);
      }

      // Fetch rounds data
      if (newEpoch) {
        const targets = [newEpoch - 2, newEpoch - 1, newEpoch, newEpoch + 1];
        const fetched = await Promise.all(targets.map(fetchRoundData));

        const updatedRoundsData: RoundsDictionary = {};
        targets.forEach((ep, i) => {
          if (ep > 0) { // Only store valid epoch numbers
            updatedRoundsData[ep] = fetched[i];
          }
        });
        setRoundsData(updatedRoundsData);
      }

      setError(null);
    } catch (err) {
      console.error("Error fetching game state:", err);
      setError(err instanceof Error ? err : new Error('Failed to fetch game state'));
    }
  }, [contract, fetchRoundData]);

  /**
   * 3. Place Bet logic
   */
  const placeBet = useCallback(
    async ({ direction, amountEth }: PlaceBetParams) => {
      if (!contract || !window.ethereum) {
        throw new Error('Wallet not connected');
      }

      try {
        const signer = await (new ethers.BrowserProvider(window.ethereum)).getSigner();
        const contractWithSigner = contract.connect(signer);

        const latestEpoch = await contract.currentEpoch();
        const fn = direction === 'bull' ? 'betBull' : 'betBear';
        
        const tx = await contractWithSigner[fn](latestEpoch, {
          value: ethers.parseEther(amountEth),
        });
        await tx.wait();

        await refreshGameState();
        await refreshUserRounds();
        setError(null);
      } catch (err) {
        console.error("Error placing bet:", err);
        throw err;
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
      const interval = setInterval(refreshGameState, 15000);
      return () => clearInterval(interval);
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
    refreshUserRounds,
    error
  };
};
