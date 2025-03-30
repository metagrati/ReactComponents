// src/main.tsx

import React from 'react';
import ReactDOM from 'react-dom/client';

// Wagmi imports (older versions typically have just WagmiConfig)
import { WagmiConfig } from 'wagmi';

// Reown adapter
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { mainnet, polygon } from '@reown/appkit/networks';

import App from './App';
import './index.css'; // If you have Tailwind/global styles

/**
 * 1) Create ONE WagmiAdapter for the entire app.
 */
export const wagmiAdapter = new WagmiAdapter({
  projectId: '9ba0d4ac5db061b3efb559c91eabfef5',
  networks: [mainnet, polygon],
});

/**
 * 2) Some older versions expose the wagmi client as `client`
 *    If yours is different (e.g. `wagmiAdapter.config`), replace below.
 */
const { wagmiConfig } = wagmiAdapter;

/**
 * 3) Wrap <App /> in <WagmiConfig> only if we have a wagmi config.
 *    If wagmiConfig is undefined or not recognized, you can skip <WagmiConfig>.
 */
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {wagmiConfig ? (
      <WagmiConfig config={wagmiConfig}>
        <App />
      </WagmiConfig>
    ) : (
      <App />
    )}
  </React.StrictMode>
);
