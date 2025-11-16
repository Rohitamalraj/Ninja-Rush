import { useEffect, useState } from 'react';
import { useSuiClient } from '@mysten/dapp-kit';

const EXPECTED_CHAIN_ID = '1bd5c965'; // OneChain Testnet

const addOneChainNetwork = async () => {
  try {
    // @ts-expect-error - Using wallet API
    if (window.oneWallet) {
      // @ts-expect-error - OneWallet API
      await window.oneWallet.request({
        method: 'wallet_addChain',
        params: [{
          chainId: EXPECTED_CHAIN_ID,
          chainName: 'OneChain Testnet',
          rpcUrls: ['https://rpc-testnet.onelabs.cc:443'],
          nativeCurrency: {
            name: 'OCT',
            symbol: 'OCT',
            decimals: 9,
          },
        }],
      });
      alert('OneChain Testnet added successfully! Please refresh the page.');
      window.location.reload();
    } else {
      alert('OneWallet not detected. Please install OneWallet extension or manually add the network. See NETWORK_SETUP.md for instructions.');
    }
  } catch (error) {
    console.error('Failed to add network:', error);
    const err = error as { code?: number; message?: string };
    if (err?.code === 4902) {
      alert('Network already exists in wallet. Please select OneChain Testnet from your wallet settings.');
    } else {
      alert(`Failed to add network: ${err?.message || 'Unknown error'}. Please add manually. See NETWORK_SETUP.md for instructions.`);
    }
  }
};

export const NetworkCheck = () => {
  const client = useSuiClient();
  const [chainId, setChainId] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkNetwork = async () => {
      try {
        const id = await client.getChainIdentifier();
        setChainId(id);
      } catch (error) {
        console.error('Failed to get chain identifier:', error);
        setChainId(null);
      } finally {
        setChecking(false);
      }
    };

    checkNetwork();
  }, [client]);

  if (checking) {
    return null; // Don't show anything while checking
  }

  if (chainId !== EXPECTED_CHAIN_ID) {
    return (
      <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 max-w-2xl">
        <div className="bg-red-500/90 backdrop-blur-sm text-white px-6 py-4 rounded-lg shadow-2xl border-2 border-red-400">
          <div className="flex items-start gap-3">
            <svg 
              className="w-6 h-6 flex-shrink-0 mt-0.5" 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path 
                fillRule="evenodd" 
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" 
                clipRule="evenodd" 
              />
            </svg>
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-1">Wrong Network Detected</h3>
              <p className="text-sm mb-3">
                Your wallet is connected to the wrong network. Please switch to <strong>OneChain Testnet</strong>.
              </p>
              <div className="bg-black/30 rounded px-3 py-2 font-mono text-xs space-y-1">
                <div>
                  <span className="text-red-300">Current Chain ID:</span>{' '}
                  <span className="text-white">{chainId || 'Unknown'}</span>
                </div>
                <div>
                  <span className="text-green-300">Expected Chain ID:</span>{' '}
                  <span className="text-white">{EXPECTED_CHAIN_ID}</span>
                </div>
              </div>
              <div className="mt-3 text-sm">
                <p className="font-semibold mb-1">Network Configuration:</p>
                <ul className="list-disc list-inside space-y-0.5 text-xs opacity-90">
                  <li>RPC: https://rpc-testnet.onelabs.cc:443</li>
                  <li>Chain ID: {EXPECTED_CHAIN_ID}</li>
                  <li>Currency: OCT</li>
                </ul>
                <p className="mt-2 text-xs opacity-75">
                  See <code className="bg-black/30 px-1 rounded">NETWORK_SETUP.md</code> for detailed instructions.
                </p>
              </div>
              <button
                onClick={addOneChainNetwork}
                className="mt-4 w-full bg-white text-red-600 font-bold py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors duration-200 shadow-lg"
              >
                Add OneChain Testnet to Wallet
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null; // Correct network, don't show warning
};
