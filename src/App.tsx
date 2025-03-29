import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { Toaster, toast } from 'react-hot-toast';
import PredictionCard from './components/PredictionCard';

// Replace with your actual contract ABI and address
const CONTRACT_ADDRESS = "0xafF9Ea1f907083706818d9411e1903351766C4d2";

async function loadAbi() {
  try {
    const response = await fetch('../abi.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const abi = await response.json();
    return abi;
  } catch (error) {
    console.error("Error loading ABI:", error);
    throw error;
  }
}

const POLYGON_CHAIN_ID = '0x89'; // 137 in hex
const POLYGON_PARAMS = {
  chainId: POLYGON_CHAIN_ID,
  chainName: 'Polygon Mainnet',
  nativeCurrency: {
    name: 'POLYGON',
    symbol: 'POL',
    decimals: 18
  },
  rpcUrls: ['https://polygon-rpc.com/'],
  blockExplorerUrls: ['https://polygonscan.com/']
};

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [contractAbi, setContractAbi] = useState([]);
  
  const [signer, setSigner] = useState<ethers.Signer | null>(null);

  useEffect(() => {
    async function fetchAbi() {
      try {
        const response = await fetch('/abi.json');
        const abi = await response.json();
        setContractAbi(abi);
      } catch (error) {
        console.error("Failed to load ABI", error);
      }
    }

    fetchAbi();
  }, []);


  const switchToPolygon = async () => {
    if (!window.ethereum) return false;

    try {
      // Try to switch to Polygon network
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: POLYGON_CHAIN_ID }],
      });
      return true;
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [POLYGON_PARAMS],
          });
          return true;
        } catch (addError) {
          console.error('Error adding Polygon network:', addError);
          toast.error('Failed to add Polygon network');
          return false;
        }
      } else {
        console.error('Error switching to Polygon network:', switchError);
        toast.error('Failed to switch network');
        return false;
      }
    }
  };

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum === 'undefined') {
        toast.error('Please install MetaMask!');
        return;
      }

      await window.ethereum.request({ method: 'eth_requestAccounts' });

      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();

      // Check if we're on Polygon
      if (network.chainId !== 137n) {
        toast.loading('Switching to Polygon network...');
        const switched = await switchToPolygon();
        if (!switched) return;

        // Get the updated provider after network switch
        const updatedProvider = new ethers.BrowserProvider(window.ethereum);
        const updatedNetwork = await updatedProvider.getNetwork();

        if (updatedNetwork.chainId !== 137n) {
          toast.error('Please switch to Polygon network');
          return;
        }
      }

      const newSigner = await provider.getSigner();
      setSigner(newSigner);
      setIsConnected(true);
      toast.success('Wallet connected!');
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast.error('Failed to connect wallet');
    }
  };

  const predict = async (direction: 'up' | 'down') => {
    try {
      if (!signer) {
        toast.error('Please connect your wallet first');
        return;
      }

      const contract = new ethers.Contract(CONTRACT_ADDRESS, contractAbi, signer);
      const tx = await contract.predict(direction === 'up', { value: ethers.parseEther("0.001") });

      toast.loading('Transaction pending...');
      await tx.wait();
      toast.success(`${direction.toUpperCase()} prediction placed!`);
    } catch (error) {
      console.error('Error predicting:', error);
      toast.error('Failed to place prediction');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-7xl mx-auto relative flex justify-center">
        <PredictionCard
          title="BTC/USD"
          amount="0.001"
          currentPrice="$71,850"
          players="124"
          timeLeft="3m"
          onPredictUp={() => predict('up')}
          onPredictDown={() => predict('down')}
          isConnected={isConnected}
          onConnect={connectWallet}
        />
      </div>
      <Toaster position="bottom-right" />
    </div>
  );
}

export default App;