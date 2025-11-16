import React from 'react';
import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit';
import { useWallet } from '../contexts/WalletContext';

export const WalletButton: React.FC = () => {
  const currentAccount = useCurrentAccount();
  const { balance } = useWallet();

  if (currentAccount) {
    return (
      <div className="fixed top-4 right-4 z-50 flex items-center gap-4">
        {/* Token Balances */}
        <div className="bg-gray-900/90 backdrop-blur-sm rounded-lg px-4 py-2 border border-gray-700">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-orange-400 text-sm font-bold">{balance.ninja.toFixed(2)}</div>
              <div className="text-gray-400 text-xs">NINJA</div>
            </div>
            <div className="w-px h-8 bg-gray-700" />
            <div className="text-center">
              <div className="text-blue-400 text-sm font-bold">{balance.oct.toFixed(4)}</div>
              <div className="text-gray-400 text-xs">OCT</div>
            </div>
          </div>
        </div>

        {/* Sui dApp Kit Connect Button (handles wallet UI) */}
        <ConnectButton />
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <ConnectButton 
        connectText="Connect OneWallet"
        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 
                   text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all duration-200"
      />
    </div>
  );
};
