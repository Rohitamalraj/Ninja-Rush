import React from 'react';
import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit';
import { useWallet } from '../contexts/WalletContext';

export const WalletButton: React.FC = () => {
  const currentAccount = useCurrentAccount();
  const { balance } = useWallet();

  if (currentAccount) {
    return (
      <div className="fixed top-6 right-6 z-[2000] flex items-center gap-3">
        {/* Token Balances - Larger and more visible */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 backdrop-blur-md rounded-2xl px-6 py-3 
                      border-2 border-purple-500/50 shadow-2xl">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-orange-400 text-2xl font-black">{balance.ninja.toFixed(0)}</div>
              <div className="text-gray-400 text-xs font-semibold tracking-wider">NINJA</div>
            </div>
            <div className="w-px h-10 bg-gradient-to-b from-transparent via-purple-500 to-transparent" />
            <div className="text-center">
              <div className="text-blue-400 text-2xl font-black">{balance.oct.toFixed(2)}</div>
              <div className="text-gray-400 text-xs font-semibold tracking-wider">OCT</div>
            </div>
          </div>
        </div>

        {/* Sui dApp Kit Connect Button - Styled */}
        <div className="transform hover:scale-105 transition-transform">
          <ConnectButton />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-6 right-6 z-[2000]">
      <div className="relative group">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 animate-pulse"></div>
        
        {/* Button */}
        <div className="relative">
          <ConnectButton 
            connectText="🔗 Connect OneWallet"
            className="!bg-gradient-to-r !from-purple-600 !to-blue-600 hover:!from-purple-700 hover:!to-blue-700 
                     !text-white !font-black !text-lg !py-4 !px-8 !rounded-2xl !shadow-2xl 
                     !border-2 !border-white/20 transform hover:scale-105 !transition-all !duration-300"
          />
        </div>
      </div>
    </div>
  );
};
